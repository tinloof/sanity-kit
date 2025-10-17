import {CogIcon, ComposeIcon} from "@sanity/icons";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import {uniqBy} from "lodash";
import {defineField, type DocumentDefinition, type SortOrdering} from "sanity";

export type DefineDocumentDefinition = Omit<DocumentDefinition, "options"> & {
  /** Schema options for various features */
  options?: {
    /** Disable document creation, used with the disableCreation plugin */
    disableCreation?: boolean;
    /** Enable localization with locale field */
    localized?: boolean;
    /** Enable document ordering with orderRank field */
    orderable?: boolean;
    /** Hide the internal title field */
    hideInternalTitle?: boolean;
  };
};

/**
 * Creates a document schema with automatic internal title, locale fields (for i18n),
 * and orderable document list support.
 *
 * This utility automatically adds common fields for document schemas including:
 * - Internal title field for document identification
 * - Locale field for internationalization (when enabled)
 * - Order rank field for document ordering (when enabled)
 * - Proper field groups (content and settings)
 *
 * @param schema - The document schema configuration
 * @returns A complete Sanity document definition with standard fields
 *
 * @example
 * ```typescript
 * export default defineDocument({
 *   name: "post",
 *   title: "Blog Post",
 *   type: "document",
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
export default function defineDocument(
  schema: DefineDocumentDefinition,
): DocumentDefinition {
  const groups = uniqBy(
    [
      {
        default: schema?.groups?.some((group) => group.default),
        icon: ComposeIcon,
        name: "content",
      },
      {
        icon: CogIcon,
        name: "settings",
      },
      ...(schema.groups || []),
    ].filter(Boolean),
    "name",
  );

  const {options, ...schemaWithoutOptions} = schema;

  const defaultFields = [
    ...(options?.orderable ? [orderRankField({type: schema.name})] : []),
    ...(options?.localized
      ? [
          defineField({
            hidden: true,
            name: "locale",
            type: "string",
          }),
        ]
      : []),
    defineField({
      description:
        "This title is only used internally in Sanity, it won't be displayed on the website.",
      group: "settings",
      hidden: options?.hideInternalTitle,
      name: "internalTitle",
      title: "Internal Title",
      type: "string",
    }),
  ].filter(Boolean);

  const allFields = [...defaultFields, ...schema.fields];

  if (allFields.length === 0) {
    throw new Error(
      `[defineDocument] "${schema.name}" must define at least one field.`,
    );
  }

  return {
    ...schemaWithoutOptions,
    fields: uniqBy(allFields, "name"),
    groups,
    orderings: options?.orderable
      ? [...(schema.orderings || []), orderRankOrdering as SortOrdering]
      : schema.orderings,
  };
}
