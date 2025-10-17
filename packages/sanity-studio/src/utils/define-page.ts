import type {DocumentDefinition} from "sanity";

import seoObjectField from "../schemas/objects/seo";
import pathnameSlugField from "../schemas/slugs/pathname";
import {FieldOptions} from "../types";
import defineDocument, {DefineDocumentDefinition} from "./define-document";

type PathnameOptions = NonNullable<
  Parameters<typeof pathnameSlugField>[0]
>["options"];

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
    pathname?: FieldOptions | PathnameOptions;
    /** Hide the entire SEO settings field */
    seo?: FieldOptions | SEOOptions;
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

  return defineDocument({
    ...schemaWithoutOptions,
    type: "document",
    fields: [
      pathname !== false
        ? pathnameSlugField({
            options: typeof pathname === "object" ? pathname : {},
            defaultLocaleId,
            disableCreation,
            hidden: pathname === "hidden",
            localized,
          })
        : undefined,
      seo !== false
        ? seoObjectField({
            hidden: seo === "hidden",
            ...(typeof seo === "object" ? seo : {}),
          })
        : undefined,
      ...fields,
    ].filter(Boolean) as DocumentDefinition["fields"],
    options: {
      disableCreation,
      localized,
      orderable,
      internalTitle,
    },
    preview: {
      select: {
        subtitle: "pathname.current",
        title: "internalTitle",
      },
      ...preview,
    },
  });
}
