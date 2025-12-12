import type {ValidationContext} from "sanity";

export type IsUniqueOptions = {
	/**
	 * The field path to check for uniqueness
	 * Defaults to "pathname.current"
	 */
	fieldPath?: string;
	/**
	 * Additional GROQ filter to apply to the query
	 * @example "_type == 'post'"
	 */
	filter?: string;
};

/**
 * Validates that a slug value is unique across documents
 *
 * @param slug - The slug value to check
 * @param context - Sanity validation context
 * @param options - Configuration options
 * @returns true if the slug is unique, false otherwise
 *
 * @example
 * ```ts
 * // Basic usage
 * isUnique(slug, context)
 *
 * // With custom field path
 * isUnique(slug, context, { fieldPath: 'slug.current' })
 *
 * // With document type filter
 * isUnique(slug, context, { filter: '_type == "post"' })
 * ```
 */
export async function isUnique(
	slug: string,
	context: ValidationContext,
	options: IsUniqueOptions = {},
): Promise<boolean> {
	const {fieldPath = "pathname.current", filter} = options;

	const {document, getClient} = context;
	const client = getClient({apiVersion: "2025-12-12"});
	const id = document?._id.replace(/^drafts\./, "");
	const params = {
		draft: `drafts.${id}`,
		published: id,
		slug,
	};

	const filterClause = filter ? ` && ${filter}` : "";
	const query = `*[!(_id in [$draft, $published]) && ${fieldPath} == $slug${filterClause}]`;
	const result = await client.fetch(query, params);

	return result.length === 0;
}
