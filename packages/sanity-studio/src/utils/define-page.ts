import type {DocumentDefinition} from "sanity";

import seoObjectField from "../schemas/objects/seo";
import pathnameSlugField from "../schemas/slugs/pathname";
import {
	applyFieldCustomization,
	type FieldCustomization,
} from "./apply-field-customization";
import defineDocument, {type DefineDocumentDefinition} from "./define-document";

type PathnameSlugFieldOptions = NonNullable<
	Parameters<typeof pathnameSlugField>[0]
>;

type SEOOptions = Pick<
	NonNullable<Parameters<typeof seoObjectField>[0]>,
	"description" | "ogImage" | "indexableStatus" | "title"
>;

/**
 * Configuration options for defining a page document schema
 */
type PageDefinition = Omit<DocumentDefinition, "options" | "type"> & {
	/** Schema options including localization and field visibility settings */
	options?: DefineDocumentDefinition["options"] & {
		/** Hide the pathname field */
		pathname?:
			| FieldCustomization<ReturnType<typeof pathnameSlugField>>
			| PathnameSlugFieldOptions;
		/** Hide the entire SEO settings field */
		seo?: FieldCustomization<ReturnType<typeof seoObjectField>> | SEOOptions;
		/** Default locale ID for localization */
		defaultLocaleId?: string;
	};
};

/**
 * Creates a page document schema with automatic pathname, SEO, and indexable fields.
 *
 * This utility automatically adds essential fields for page documents including:
 * - Pathname field for URL routing with i18n support
 * - SEO field with title, description, and social image
 * - Internal title field for document identification
 * - Proper field groups (content and settings)
 *
 * @param schema - The page schema configuration
 * @returns A complete Sanity document definition with page-specific fields
 *
 * @example
 * ```typescript
 * export default definePage({
 *   name: "page",
 *   title: "Page",
 *   fields: [
 *     {
 *       name: "title",
 *       type: "string",
 *       title: "Title",
 *     },
 *   ],
 * });
 * ```
 */
export default function definePage(schema: PageDefinition): DocumentDefinition {
	const {options, preview, fields, ...schemaWithoutOptions} = schema;

	const {
		defaultLocaleId,
		disableCreation,
		pathname,
		localized,
		seo,
		internalTitle,
		orderable,
	} = options || {};

	const isPathnameFieldCustomization = (
		value:
			| FieldCustomization<ReturnType<typeof pathnameSlugField>>
			| PathnameSlugFieldOptions
			| undefined,
	): value is FieldCustomization<ReturnType<typeof pathnameSlugField>> => {
		// If it's a function, boolean, or "hidden", it's FieldCustomization
		if (
			typeof value === "function" ||
			typeof value === "boolean" ||
			value === "hidden"
		) {
			return true;
		}
		// If it's an object, check if it has PathnameSlugFieldOptions properties
		if (typeof value === "object" && value !== null) {
			const hasPathnameProp =
				"localized" in value ||
				"defaultLocaleId" in value ||
				"options" in value ||
				"hidden" in value ||
				"disableCreation" in value;
			return !hasPathnameProp; // If no pathname props, treat as FieldCustomization
		}
		return false;
	};

	const isSeoFieldCustomization = (
		value:
			| FieldCustomization<ReturnType<typeof seoObjectField>>
			| SEOOptions
			| undefined,
	): value is FieldCustomization<ReturnType<typeof seoObjectField>> => {
		// If it's a function, boolean, or "hidden", it's FieldCustomization
		if (
			typeof value === "function" ||
			typeof value === "boolean" ||
			value === "hidden"
		) {
			return true;
		}
		// If it's an object, check if it has SEOOptions properties
		if (typeof value === "object" && value !== null) {
			const hasSeoProp =
				"title" in value ||
				"description" in value ||
				"ogImage" in value ||
				"indexableStatus" in value;
			return !hasSeoProp; // If no SEO props, treat as FieldCustomization
		}
		return false;
	};

	return defineDocument({
		...schemaWithoutOptions,
		type: "document",
		fields: [
			pathname !== false
				? (() => {
						if (isPathnameFieldCustomization(pathname)) {
							return applyFieldCustomization(
								pathnameSlugField({
									defaultLocaleId,
									disableCreation,
									localized: localized !== false,
								}),
								pathname,
							);
						}
						return pathnameSlugField(
							typeof pathname === "object" && pathname !== null
								? (pathname as PathnameSlugFieldOptions)
								: {
										defaultLocaleId,
										disableCreation,
										localized: localized !== false,
									},
						);
					})()
				: undefined,
			seo !== false
				? (() => {
						if (isSeoFieldCustomization(seo)) {
							return applyFieldCustomization(seoObjectField({}), seo);
						}
						return seoObjectField(
							typeof seo === "object" && seo !== null
								? (seo as SEOOptions)
								: {},
						);
					})()
				: undefined,
			...fields,
		].filter(Boolean) as DocumentDefinition["fields"],
		options: {
			disableCreation,
			localized,
			orderable,
			internalTitle,
		},
		preview: preview ?? {
			select: {
				title: "internalTitle",
				subtitle: "pathname.current",
			},
		},
	});
}
