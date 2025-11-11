import {
  DocumentBadgeComponent,
  DocumentBadgesContext,
  DocumentDefinition,
  DocumentPluginOptions,
  type SchemaTypeDefinition,
} from "sanity";

/**
 * Retrieves the badges configuration from a document schema type's options.
 *
 * @param schemas - Array of schema type definitions from the Sanity schema
 * @param schemaType - The name of the schema type to get badges config for
 * @returns The badges configuration if found, undefined otherwise
 *
 * @internal
 */
function getDocumentBadgesConfig(
  schemas: SchemaTypeDefinition[],
  schemaType: string,
): DocumentPluginOptions["badges"] {
  const schema = schemas.find((s) => s.name === schemaType);
  if (!schema || schema.type !== "document") return undefined;

  return (schema as DocumentDefinition).options?.document?.badges;
}

/**
 * A document badges resolver that automatically applies badges configuration
 *
 * This function reads the `badges` option from your document schemas and applies
 * the appropriate filtering/customization to the available document badges in
 * Sanity Studio.
 *
 * @example Basic usage in sanity.config.ts
 * ```ts
 * // In your sanity.config.ts
 * import {documentOptionsPlugin} from "@tinloof/sanity-document-options";
 *
 * export default defineConfig({
 *   plugins: [
 *     documentOptionsPlugin, // Enable automatic badges filtering
 *   ],
 * });
 * ```
 *
 * @example Schema configuration with custom function
 * ```ts
 * defineType({
 *   name: "post",
 *   title: "Post",
 *   fields: [...],
 *   options: {
 *     document: {
 *       badges: (prev, context) => {
 *         // Add custom badge for draft posts
 *         if (!context.published) {
 *           return [
 *             ...prev,
 *             {
 *               label: 'Draft',
 *               title: 'This post is in draft mode',
 *               color: 'warning'
 *             }
 *           ];
 *         }
 *         return prev;
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @example Schema configuration with additional badges
 * ```ts
 * defineType({
 *   name: "page",
 *   title: "Page",
 *   fields: [...],
 *   options: {
 *     document: {
 *       badges: [customStatusBadge, customPriorityBadge],
 *     },
 *   },
 * });
 * ```
 *
 * **Supported Configuration Types:**
 * - **Function**: `(prev, context) => DocumentBadgeComponent[]` - Custom resolver function that receives existing badges and context
 * - **Array**: `DocumentBadgeComponent[]` - Additional badges to append to existing ones
 *
 * @param prev - The existing document badge components from Sanity and other plugins
 * @param context - The document badges context containing schema information and document data
 * @returns The filtered/modified array of document badge components
 *
 * @see {@link https://www.sanity.io/docs/document-badges | Sanity Document Badges Documentation}
 * @internal
 */
export default function defineBadges(
  prev: DocumentBadgeComponent[],
  context: DocumentBadgesContext,
): DocumentBadgeComponent[] {
  const {
    schema: {_original},
    schemaType,
  } = context;

  const {types: schemas = []} = (_original as {
    types: SchemaTypeDefinition[];
  }) || {
    types: [],
  };

  // Get the badges configuration for this schema type
  const badgesConfig = getDocumentBadgesConfig(schemas, schemaType);

  // If no badges config is found, return the original badges unchanged
  if (!badgesConfig) {
    return prev;
  }

  // If config is an array of badges, append them to existing badges
  if (Array.isArray(badgesConfig)) {
    return [...prev, ...badgesConfig];
  }

  // If config is a function, call it with the previous badges and context
  if (typeof badgesConfig === "function") {
    return badgesConfig(prev, context);
  }

  // Fallback: return original badges if config type is unexpected
  return prev;
}
