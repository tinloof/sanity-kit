import {CogIcon, ComposeIcon} from "@sanity/icons";
import {
  orderRankField,
  orderRankOrdering,
} from "@sanity/orderable-document-list";
import {uniqBy} from "lodash";
import {defineField, type DocumentDefinition, type SortOrdering} from "sanity";

export type DefineSchemaDefinition = Omit<DocumentDefinition, "options"> & {
  options?: {
    disableCreation?: boolean;
    hideInternalTitle?: boolean;
    localized?: boolean;
    orderable?: boolean;
  };
};

export default function defineSchema(
  schema: DefineSchemaDefinition,
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

  return {
    ...schemaWithoutOptions,
    fields: uniqBy(
      [
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
        ...schema.fields,
      ].filter(Boolean),
      "name",
    ),
    groups,
    orderings: options?.orderable
      ? [...(schema.orderings || []), orderRankOrdering as SortOrdering]
      : schema.orderings,
  };
}
