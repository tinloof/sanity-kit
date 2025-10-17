import type {DocumentDefinition} from "sanity";
import {defineField, isDev} from "sanity";

import {InputWithCharacterCount} from "../components/input-with-characters-count";
import type {PathnameParams} from "../types";
import defineDocument, {DefineDocumentDefinition} from "./define-document";
import {definePathname} from "./definePathname";

/**
 * Configuration options for defining a page document schema
 */
type PageDefinition = Omit<DocumentDefinition, "options" | "type"> & {
  /** Schema options including localization and field visibility settings */
  options?: DefineDocumentDefinition["options"] & {
    /** Hide the indexable status field in SEO settings */
    hideIndexableStatus?: boolean;
    /** Hide the pathname field */
    hidePathnameField?: boolean;
    /** Hide the entire SEO settings field */
    hideSeo?: boolean;
    /** Default locale ID for localization */
    defaultLocaleId?: string;
  };
  /** Options for the pathname field behavior */
  pathnameOptions?: PathnameParams["options"] & {
    /** Initial value for the pathname field */
    initialValue?: string;
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
  const {initialValue, ...pathnameOptions} = schema.pathnameOptions || {};
  const {options, preview, fields, ...schemaWithoutOptions} = schema;

  return defineDocument({
    ...schemaWithoutOptions,
    type: "document",
    fields: [
      defineField({
        ...definePathname({
          options: {
            i18n:
              options?.localized && options?.defaultLocaleId
                ? {
                    defaultLocaleId: options?.defaultLocaleId,
                    enabled: true,
                  }
                : undefined,
            ...pathnameOptions,
          },
        }),
        group: "settings",
        readOnly: options?.disableCreation && !isDev,
        hidden: options?.hidePathnameField,
        initialValue: {current: initialValue},
      }),
      defineField({
        name: "seo",
        title: "SEO",
        type: "object",
        group: "settings",
        hidden: options?.hideSeo,
        options: {collapsed: false, collapsible: true},
        fields: [
          defineField({
            description:
              "Won't show up in search engines if set to false, but accessible through URL.",
            initialValue: true,
            name: "indexable",
            type: "boolean",
            validation: options?.hideIndexableStatus
              ? undefined
              : (Rule) => Rule.required(),
            hidden: options?.hideIndexableStatus,
          }),
          {
            components: {
              input: InputWithCharacterCount,
            },
            name: "title",
            options: {
              maxLength: 70,
              minLength: 15,
            },
            type: "string",
          },
          {
            components: {
              input: InputWithCharacterCount,
            },
            name: "description",
            options: {
              maxLength: 160,
              minLength: 50,
            },
            rows: 2,
            title:
              "Short description for SEO & social sharing (meta description)",
            type: "text",
          },
          {
            description:
              "Highly encouraged for increasing conversion rates for links to this page shared in social media.",
            name: "ogImage",
            options: {
              hotspot: true,
            },
            title: "Social Sharing Image",
            type: "image",
          },
        ],
      }),
      ...fields,
    ].filter(Boolean),
    options: {
      ...(options ?? {}),
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
