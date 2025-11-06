import {ConfigContext, SchemaTypeDefinition, Template} from "sanity";

import {TemplatesPolicy} from "../types";

/**
 * Type guard to check if a value is a valid template with all required properties.
 *
 * A valid template must have:
 * - A non-empty string `id` property
 * - A string `schemaType` property
 *
 * @param template - The value to validate
 * @returns `true` if the value is a valid template, `false` otherwise
 */
function isValidTemplate(template: unknown): template is Template {
  return (
    Boolean(template) &&
    typeof template === "object" &&
    template !== null &&
    "id" in template &&
    typeof (template as Template).id === "string" &&
    (template as Template).id.length > 0 &&
    "schemaType" in template &&
    typeof (template as Template).schemaType === "string"
  );
}

/**
 * Type guard to check if a value is a template with at least a valid ID.
 *
 * This is a partial validation used when only the ID is needed for operations.
 * A valid template ID must be a non-empty string.
 *
 * @param template - The value to validate
 * @returns `true` if the value has a valid template ID, `false` otherwise
 */
function hasTemplateId(template: unknown): template is Template {
  return (
    Boolean(template) &&
    typeof template === "object" &&
    template !== null &&
    "id" in template &&
    typeof (template as Template).id === "string" &&
    (template as Template).id.length > 0
  );
}

/**
 * Type guard to check if a value is a valid template ID string.
 *
 * A valid template ID must be a non-empty string.
 *
 * @param id - The value to validate
 * @returns `true` if the value is a valid template ID string, `false` otherwise
 */
function isValidTemplateId(id: unknown): id is string {
  return typeof id === "string" && id.length > 0;
}

/**
 * Creates a templates resolver that filters and modifies templates based on
 * the `templates` configuration from document schemas.
 *
 * This function controls which templates are available when creating new documents
 * of a specific type. When a document type has `templates` configured, this resolver
 * will filter, modify, or add templates based on the configuration and the current
 * user's roles.
 *
 * Can be used directly as a resolver: `schema: { templates: defineSchemaTemplates }`
 *
 * @param prev - Previous templates from Sanity
 * @param context - Config context from Sanity, containing current user and schema information
 * @returns Filtered and modified templates based on the schema's templates configuration
 *
 * @example
 * ```typescript
 * // In your Sanity Studio configuration:
 * export default defineConfig({
 *   schema: {
 *     types: schemas,
 *     templates: defineSchemaTemplates,
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // In your document schema definition:
 *
 * // Remove all templates for this type
 * templates: false
 *
 * // Keep all templates (default behavior)
 * templates: true
 *
 * // Only allow specific templates
 * templates: {
 *   include: ["template-id-1", "template-id-2"],
 * }
 *
 * // Modify existing templates
 * templates: {
 *   modify: {
 *     "template-id": (template) => ({
 *       ...template,
 *       value: {...template.value, customField: "value"},
 *     }),
 *   },
 * }
 *
 * // Role-based template policies
 * templates: {
 *   byRole: {
 *     administrator: false, // Remove all templates for administrators
 *     editor: {
 *       include: ["template-id-1"],
 *     },
 *   },
 * }
 * ```
 */
export default function defineSchemaTemplates(
  prev: Template[],
  context: ConfigContext,
): Template[] {
  const {
    currentUser,
    schema: {_original},
  } = context;

  const {types: schemas = []} = (_original as {
    types: SchemaTypeDefinition[];
  }) || {
    types: [],
  };

  // Build schema map
  const schemaMap = new Map(
    schemas.filter((s) => s && s.name).map((s) => [s.name, s]),
  );

  const userRoles = currentUser?.roles?.map((role) => role.name) || [];

  // Group templates by schemaType
  const templatesBySchemaType = new Map<string, Template[]>();
  for (const template of prev) {
    if (!isValidTemplate(template)) continue;

    const existing = templatesBySchemaType.get(template.schemaType) || [];
    existing.push(template);
    templatesBySchemaType.set(template.schemaType, existing);
  }

  const result: Template[] = [];

  // Process each schemaType group
  for (const [schemaType, templates] of templatesBySchemaType) {
    const config = getTemplatesConfig(schemaMap, schemaType);

    // No config: keep all templates for this type
    if (config === undefined) {
      result.push(...templates);
      continue;
    }

    // Boolean config: keep all or remove all
    if (typeof config === "boolean") {
      if (config) result.push(...templates);
      continue;
    }

    // Object config: handle modify, include, add, and byRole
    if (
      typeof config === "object" &&
      config !== null &&
      Object.keys(config).length > 0
    ) {
      const effectiveConfig = applyRolePolicy(config, userRoles);

      // If effective config is a boolean after applying role policy, handle it
      if (typeof effectiveConfig === "boolean") {
        if (effectiveConfig) result.push(...templates);
        continue;
      }

      const filteredTemplates = applyTemplatesPolicy(
        templates,
        effectiveConfig,
      );
      result.push(...filteredTemplates);
    }
  }

  return result;
}

/**
 * Applies role-based policy to a templates configuration.
 *
 * If the user has roles that match entries in `config.byRole`, the matching
 * role policy is merged with the base config (role policy takes precedence).
 * If the role policy is a boolean, it is returned directly.
 *
 * @param config - The templates policy configuration (must be an object, not boolean)
 * @param userRoles - Array of role names for the current user
 * @returns The effective templates policy after applying role-based rules
 *
 * @remarks
 * - The first matching role policy is used (roles are checked in order)
 * - Role policies can be booleans or objects
 * - Boolean role policies override the entire base config
 * - Object role policies are merged with the base config
 */
function applyRolePolicy(
  config: Exclude<TemplatesPolicy, boolean>,
  userRoles: string[],
): TemplatesPolicy {
  if (!config.byRole || userRoles.length === 0) return config;

  for (const userRole of userRoles) {
    const rolePolicy = config.byRole[userRole];
    if (rolePolicy !== undefined) {
      // If role policy is a boolean, return it directly
      if (typeof rolePolicy === "boolean") {
        return rolePolicy;
      }
      // Otherwise, merge the role policy with base config
      return {
        ...config,
        ...rolePolicy,
        byRole: undefined,
      };
    }
  }

  return config;
}

/**
 * Applies a templates policy to filter and modify templates.
 *
 * This function processes templates in the following order:
 * 1. Filter templates using `include` (whitelist)
 * 2. Modify templates using `modify` (by ID, with callbacks or replacement)
 * 3. Add new templates using `add`
 *
 * @param templates - The templates to process
 * @param config - The templates policy configuration (must be an object, not boolean)
 * @returns The processed templates array
 *
 * @remarks
 * - `include` acts as a whitelist - only templates with IDs in the list are kept
 * - `modify` can replace templates completely or use callbacks to transform them
 * - `add` appends new templates to the result
 * - Invalid templates are filtered out at each step
 */
function applyTemplatesPolicy(
  templates: Template[],
  config: Exclude<TemplatesPolicy, boolean>,
): Template[] {
  let filteredTemplates: Template[] = [];

  // Start with prev templates, then filter with include
  filteredTemplates = templates.filter((template) => {
    if (!hasTemplateId(template)) return false;

    const templateId = template.id;

    // If include is specified, only keep templates in include list (whitelist)
    if (config.include && config.include.length > 0) {
      const validIncludes = config.include.filter(isValidTemplateId);
      return validIncludes.includes(templateId);
    }

    // No include: keep all
    return true;
  });

  // Modify specific templates by ID
  if (config.modify && Object.keys(config.modify).length > 0) {
    const modifiedIds = new Set<string>();
    filteredTemplates = filteredTemplates
      .map((template) => {
        if (!hasTemplateId(template)) return template;

        const modifier = config.modify?.[template.id];
        if (modifier) {
          modifiedIds.add(template.id);
          // If modifier is a function, call it with the current template
          if (typeof modifier === "function") {
            try {
              const result = modifier(template);
              return isValidTemplate(result) ? result : template;
            } catch (error) {
              console.warn(
                `[defineSchemaTemplates] Error in modify callback for template "${template.id}":`,
                error,
              );
              return template;
            }
          }
          // Otherwise, it's a Template object - replace completely
          return isValidTemplate(modifier) ? modifier : template;
        }
        return template;
      })
      .filter((template): template is Template => Boolean(template));

    // Add new templates from modify that don't exist yet (only if they're Template objects, not functions)
    for (const [templateId, modifier] of Object.entries(config.modify)) {
      if (!isValidTemplateId(templateId)) continue;

      if (!modifiedIds.has(templateId) && typeof modifier !== "function") {
        if (isValidTemplate(modifier)) {
          filteredTemplates.push(modifier);
        }
      }
    }
  }

  // Add new templates
  if (config.add && config.add.length > 0) {
    const validTemplates = config.add.filter(isValidTemplate);
    filteredTemplates.push(...validTemplates);
  }

  return filteredTemplates;
}

/**
 * Retrieves the templates configuration for a specific schema type.
 *
 * @param schemaMap - Map of schema names to schema definitions
 * @param schemaType - The schema type name to get configuration for
 * @returns The templates policy configuration, or `undefined` if not found or not a document type
 */
function getTemplatesConfig(
  schemaMap: Map<string, SchemaTypeDefinition>,
  schemaType: string,
): TemplatesPolicy | undefined {
  const schema = schemaMap.get(schemaType);
  if (!schema || schema.type !== "document") return undefined;

  return (schema.options as {templates?: TemplatesPolicy} | undefined)
    ?.templates;
}
