/* eslint-disable @typescript-eslint/no-explicit-any */
import type {ConfigContext, DocumentDefinition, Template} from "sanity";

/**
 * Applies template configuration from schema options.
 *
 * @example
 * ```ts
 * defineType({
 *   options: {
 *     schema: {
 *       templates: [{
 *         id: 'post-blog',
 *         title: 'Blog Post',
 *         schemaType: 'post',
 *         value: { category: 'blog' }
 *       }]
 *     }
 *   }
 * })
 * ```
 * @internal
 */
export default function defineTemplates(
  prev: Template<any, any>[],
  context: ConfigContext,
): Template<any, any>[] {
  const schema = context.schema;
  const allTypes = (schema?._original?.types || []) ?? [];
  const allDocumentTypes = allTypes.filter(
    (type) => type.type === "document",
  ) as DocumentDefinition[];
  const templatesFromSchemas = allDocumentTypes
    .filter((type) => type.options?.schema?.templates)
    .flatMap((def) => {
      const templates = def.options!.schema!.templates!;

      if (typeof templates === "function") {
        return templates([], context);
      }

      if (Array.isArray(templates)) {
        return templates;
      }

      return [];
    });

  if (!templatesFromSchemas.length) {
    return prev;
  }
  return [...prev, ...templatesFromSchemas];
}
