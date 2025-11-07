import {BaseSchemaDefinition} from "sanity";
import {ListItemBuilder, StructureBuilder} from "sanity/structure";

import {i18nConfig} from "../types";
import {singletonListItem} from "./singleton-list-item";

export const localizedSingletonItem = (
  S: StructureBuilder,
  name: string,
  title: string,
  locales: i18nConfig["locales"],
  icon?: BaseSchemaDefinition["icon"],
): ListItemBuilder => {
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

  const listItem = S.listItem()
    .title(title)
    .child(
      S.list()
        .title("Locales")
        .items(
          locales.map((locale) => {
            const item = singletonListItem(
              S,
              name,
              `${locale.title} (${locale.id})`,
              `${name}_${locale.id}`,
            );

            return icon ? item.icon(icon) : item;
          }),
        ),
    );

  return icon ? listItem.icon(icon) : listItem;
};
