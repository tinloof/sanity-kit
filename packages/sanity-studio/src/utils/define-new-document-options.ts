import {
  NewDocumentOptionsContext,
  SchemaTypeDefinition,
  TemplateItem,
} from "sanity";

import {NewDocumentOptions} from "../types";

/**
 * Type guard to check if config is an array of roles
 */
function isRoleArray(config: NewDocumentOptions): config is string[] {
  return Array.isArray(config);
}

/**
 * Get the newDocumentOptions configuration for a schema type
 */
function getNewDocumentOptionsConfig(
  schemaMap: Map<string, SchemaTypeDefinition>,
  schemaType: string,
): NewDocumentOptions | undefined {
  const schema = schemaMap.get(schemaType);
  if (!schema || schema.type !== "document") return undefined;

  return (
    schema.options as {newDocumentOptions?: NewDocumentOptions} | undefined
  )?.newDocumentOptions;
}

/**
 * Creates a new document options resolver that filters templates based on
 * the newDocumentOptions configuration from document schemas.
 *
 * This function controls which document types appear in the new document creation menu,
 * including the global Create button and the create button that appears in reference fields
 * for specific document types. When a document type has `newDocumentOptions` configured,
 * this resolver will filter the available templates based on the configuration and the
 * current user's roles.
 *
 * Can be used directly as a resolver: `document: { newDocumentOptions: defineNewDocumentOptions }`
 *
 * @param prev - Previous template items from Sanity
 * @param context - New document options context from Sanity, containing current user and schema information
 * @returns Filtered template items based on the schema's newDocumentOptions configuration
 *
 * @see {@link https://www.sanity.io/docs/studio/new-document-options#dd286e30bb2e Sanity Documentation: New Document Options}
 *
 * @example
 * ```typescript
 * // In your document schema definition:
 *
 * // Allow all templates (default behavior)
 * newDocumentOptions: true
 *
 * // Disable all templates (hide from create menu and reference fields)
 * newDocumentOptions: false
 *
 * // Allow only specific roles
 * newDocumentOptions: ["editor", "administrator"]
 * ```
 */
export default function defineNewDocumentOptions(
  prev: TemplateItem[],
  context: NewDocumentOptionsContext,
): TemplateItem[] {
  const {
    currentUser,
    schema: {_original},
  } = context;

  const {types: schemas = []} = (_original as {
    types: SchemaTypeDefinition[];
  }) || {
    types: [],
  };

  const schemaMap = new Map(schemas.map((s) => [s.name, s]));

  const userRoles = currentUser?.roles?.map((role) => role.name) || [];

  return prev.filter((templateItem) => {
    const config = getNewDocumentOptionsConfig(
      schemaMap,
      templateItem.templateId,
    );

    // If no configuration, allow all templates (default behavior)
    if (config === undefined) {
      return true;
    }

    // If boolean, use it directly
    if (typeof config === "boolean") return config;

    // If role array configuration, check user roles
    if (isRoleArray(config)) {
      // Explicitly deny when no roles are specified
      if (config.length === 0) {
        return false;
      }

      const allowedRoles = config as string[];
      return userRoles.some((userRole) => allowedRoles.includes(userRole));
    }

    return true;
  });
}
