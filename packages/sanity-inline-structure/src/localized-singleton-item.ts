import {BaseSchemaDefinition} from "sanity";
import {
  ListItemBuilder,
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import {singletonListItem} from "./singleton-list-item";
import {Locale} from "./types";

type LocalizedSingletonItemProps = {
  S: StructureBuilder;
  context: StructureResolverContext;
  name: string;
  title: string;
  locales: Locale[];
  icon?: BaseSchemaDefinition["icon"];
};

export const localizedSingletonItem = ({
  S,
  context,
  name,
  title,
  locales,
  icon,
}: LocalizedSingletonItemProps): ListItemBuilder => {
  // Input validation
  if (!name || typeof name !== "string") {
    throw new Error(
      "localizedSingletonItem: name parameter must be a non-empty string",
    );
  }
  if (!title || typeof title !== "string") {
    throw new Error(
      "localizedSingletonItem: title parameter must be a non-empty string",
    );
  }
  if (!Array.isArray(locales) || locales.length === 0) {
    throw new Error(
      "localizedSingletonItem: locales must be a non-empty array",
    );
  }
  if (!locales.every((locale) => locale.id && locale.title)) {
    throw new Error(
      "localizedSingletonItem: each locale must have an id and title",
    );
  }

  // Create translation metadata document
  context.getClient({apiVersion: "2025-11-14"}).createIfNotExists({
    _type: "translation.metadata",
    _id: `${name}_translations_metadata`,
    schemaTypes: [name],
    translations: locales.map((locale) => ({
      _type: "internationalizedArrayReferenceValue",
      _key: locale.id,
      value: {
        _ref: `${name}_${locale.id}`,
        _type: "reference",
        _weak: true,
        _strengthenOnPublish: {
          type: name,
        },
      },
    })),
  });

  const listItem = S.listItem()
    .title(title)
    .child(
      S.list()
        .title("Locales")
        .items(
          locales.map((locale) =>
            singletonListItem({
              S,
              type: name,
              title: `${locale.title} (${locale.id})`,
              id: `${name}_${locale.id}`,
            }).icon(icon),
          ),
        ),
    );

  return listItem.icon(icon);
};
