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

	const schemaTypesToClearTemplates = new Set<string>();

	const templatesFromSchemas = allDocumentTypes
		.filter((type) => type.options?.schema?.templates)
		.flatMap((def) => {
			const templates = def.options!.schema!.templates!;

			if (typeof templates === "function") {
				const result = templates(
					prev.filter((t) => t.schemaType === def.name),
					context,
				);
				// If function returns empty array, it means clear all templates for this schema type
				if (Array.isArray(result) && result.length === 0) {
					schemaTypesToClearTemplates.add(def.name);
				}
				return result;
			}

			if (Array.isArray(templates)) {
				// If array is empty, it means clear all templates for this schema type
				if (templates.length === 0) {
					schemaTypesToClearTemplates.add(def.name);
				}
				return templates;
			}

			return [];
		});

	// Filter out templates for schema types that should be cleared
	const filteredPrev = prev.filter(
		(template) => !schemaTypesToClearTemplates.has(template.schemaType),
	);

	if (!templatesFromSchemas.length && schemaTypesToClearTemplates.size === 0) {
		return prev;
	}

	// Combine filtered previous templates with new templates and deduplicate by id
	return [...filteredPrev, ...templatesFromSchemas].reduce(
		(acc, template) => {
			const existingIndex = acc.findIndex(
				(t: Template<any, any>) => t.id === template.id,
			);
			if (existingIndex === -1) {
				acc.push(template);
			} else {
				// Replace existing template with the new one (templates from schemas take precedence)
				acc[existingIndex] = template;
			}
			return acc;
		},
		[] as Template<any, any>[],
	);
}
