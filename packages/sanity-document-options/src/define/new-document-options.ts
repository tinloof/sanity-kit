import type {
  DocumentDefinition,
  NewDocumentOptionsContext,
  TemplateItem,
} from "sanity";

/**
 * Applies new document options configuration from schema options.
 *
 * @example
 * ```ts
 * defineType({
 *   options: {
 *     document: {
 *       newDocumentOptions: (prev, context) =>
 *         prev.filter(template => template.schemaType !== 'draft')
 *     }
 *   }
 * })
 * ```
 * @internal
 */
export default function defineNewDocumentOptions(
  prev: TemplateItem[],
  context: NewDocumentOptionsContext,
): TemplateItem[] {
  const schema = context.schema;
  const allTypes = (schema?._original?.types || []) ?? [];
  const allDocumentTypes = allTypes.filter(
    (type) => type.type === "document",
  ) as DocumentDefinition[];

  const docsWithConfig = allDocumentTypes
    .filter(
      (type) =>
        typeof type.options?.document?.newDocumentOptions === "function",
    )
    .map((def) => def.options!.document!.newDocumentOptions!);

  if (!docsWithConfig.length) {
    return prev;
  }

  return docsWithConfig.reduce((acc, fn) => fn(acc, context), prev);
}
