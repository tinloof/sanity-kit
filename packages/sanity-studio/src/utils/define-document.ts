import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import {uniqBy} from "lodash";
import {type DocumentDefinition, type SortOrdering} from "sanity";

import {contentSchemaGroup, settingsSchemaGroup} from "../schemas/groups";
import {internalTitleStringField, localeStringField} from "../schemas/strings";
import {
  DocumentStructureOptions,
  NewDocumentOptions,
  SanityActions,
  TemplatesPolicy,
} from "../types";
import {
  applyFieldCustomization,
  FieldCustomization,
} from "./apply-field-customization";

export type DefineDocumentDefinition = Omit<DocumentDefinition, "options"> & {
  /** Schema options for various features */
  options?: {
    /** Disable document creation, used with the disableCreation plugin */
    disableCreation?: boolean;
    /** Enable localization with locale field */
    localized?: FieldCustomization<typeof localeStringField>;
    /** Enable document ordering with orderRank field */
    orderable?: FieldCustomization<ReturnType<typeof orderRankField>>;
    /** Hide the internal title field */
    internalTitle?: FieldCustomization<typeof internalTitleStringField>;
    /** Configure which document actions are available in the Sanity Studio */
    documentActions?: SanityActions;
    newDocumentOptions?: NewDocumentOptions;
    templates?: TemplatesPolicy;
    structure?: DocumentStructureOptions;
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
        ...contentSchemaGroup,
        default: schema?.groups?.some((group) => group.default),
      },
      settingsSchemaGroup,
      ...(schema.groups || []),
    ].filter(Boolean),
    "name",
  );

  const {options, preview, ...schemaWithoutOptions} = schema;

  const {
    localized = false,
    internalTitle = false,
    orderable = false,
    documentActions = "default",
    newDocumentOptions = true,
    templates = true,
    structure,
    ...restOfOptions
  } = options || {};

  const internalTitleField = internalTitle
    ? applyFieldCustomization(internalTitleStringField, internalTitle)
    : null;

  const localizedField = localized
    ? applyFieldCustomization(localeStringField, localized)
    : null;

  const orderRankFieldInstance = orderable
    ? orderRankField({type: schema.name})
    : null;

  const defaultFields = [
    ...(orderRankFieldInstance ? [orderRankFieldInstance] : []),
    ...(localizedField ? [localizedField] : []),
    ...(internalTitleField ? [internalTitleField] : []),
  ];

  const allFields = [...defaultFields, ...schema.fields];

  if (allFields.length === 0) {
    throw new Error(
      `[defineDocument] "${schema.name}" must define at least one field.`,
    );
  }

  return {
    ...schemaWithoutOptions,
    options: {
      newDocumentOptions,
      ...(documentActions ? {documentActions} : {}),
      templates,
      structure,
      ...restOfOptions,
      localized: !!localized,
      orderable: !!orderable,
    },
    fields: uniqBy(allFields, "name"),
    groups,
    orderings: options?.orderable
      ? [...(schema.orderings || []), orderRankOrdering as SortOrdering]
      : schema.orderings,
    preview: preview ?? {
      select: {
        title: "internalTitle",
      },
      prepare: ({title}) => ({
        title: title ?? schema?.title,
      }),
    },
  };
}
