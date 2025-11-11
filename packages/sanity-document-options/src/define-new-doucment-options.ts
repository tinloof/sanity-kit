import type {
  DocumentDefinition,
  NewDocumentOptionsContext,
  TemplateItem,
} from "sanity";

/**
 * A new document options resolver that automatically applies new document configuration
 * from document schemas.
 *
 * This function reads the `newDocumentOptions` option from your document schemas and applies
 * the appropriate filtering/customization to the new document templates available in
 * Sanity Studio's "Create new document" interface.
 *
 * **Usage:**
 * ```ts
 * // In your sanity.config.ts
 * import {defineNewDocumentOptions} from "@tinloof/sanity-studio";
 *
 * export default defineConfig({
 *   document: {
 *     newDocumentOptions: defineNewDocumentOptions, // Enable automatic template filtering
 *   },
 * });
 * ```
 *
 * **Schema Configuration:**
 * The new document options are configured in your document schemas using the `newDocumentOptions` option:
 *
 * ```ts
 * defineDocument({
 *   name: "post",
 *   title: "Post",
 *   fields: [
 *     // ... your fields
 *   ],
 *   options: {
 *     document: {
 *       newDocumentOptions: (prev, context) => {
 *         // Custom new document options function
 *         return prev.filter(template => template.schemaType !== 'draft');
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * **Multiple Schema Configurations:**
 * When multiple document types have `newDocumentOptions` configured, this function chains
 * them together, passing the result of each configuration through to the next one.
 *
 * @param prev - The existing template items from Sanity and other plugins
 * @param context - The new document options context containing schema information
 * @returns The filtered/modified array of template items
 *
 * @example
 * ```ts
 * // Hide specific document types from the create menu
 * defineDocument({
 *   name: "internalSettings",
 *   title: "Internal Settings",
 *   fields: [...],
 *   options: {
 *     document: {
 *       newDocumentOptions: (prev, context) => {
 *         // Hide this document type from all create options
 *         return prev.filter(template => template.schemaType !== 'internalSettings');
 *       },
 *     },
 *   },
 * });
 * ```
 *
 * @internal
 * @see {@link https://www.sanity.io/docs/studio/new-document-options New Document Options Documentation}
 */
export default function defineNewDocumentOptions(
  prev: TemplateItem[],
  context: NewDocumentOptionsContext,
): TemplateItem[] {
  /** Extract the schema from the context */
  const schema = context.schema;

  /** Get all schema types, defaulting to empty array if not available */
  const allTypes = (schema?._original?.types || []) ?? [];

  /** Filter to only document type definitions */
  const allDocumentTypes = allTypes.filter(
    (type) => type.type === "document",
  ) as DocumentDefinition[];

  /**
   * Find all document types that have a newDocumentOptions function configured
   * and extract their configuration functions
   */
  const docsWithConfig = allDocumentTypes
    .filter(
      (type) =>
        typeof type.options?.document?.newDocumentOptions === "function",
    )
    .map((def) => def.options!.document!.newDocumentOptions!);

  /** If no documents have newDocumentOptions configured, return original templates */
  if (!docsWithConfig.length) {
    return prev;
  }

  /**
   * Chain all configuration functions together by reducing over them.
   * Each function receives the accumulated result from the previous function,
   * allowing multiple document types to modify the template list sequentially.
   */
  return docsWithConfig.reduce((acc, fn) => fn(acc, context), prev);
}
