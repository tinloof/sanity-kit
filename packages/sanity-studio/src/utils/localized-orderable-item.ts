import {FolderIcon} from "@sanity/icons";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import {BaseSchemaDefinition} from "sanity";
import {
  ListItemBuilder,
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import {i18nConfig} from "../types";
import {pluralize} from "./pluralize";

export interface LocalizedOrderableItemOptions {
  S: StructureBuilder;
  context: StructureResolverContext;
  name: string;
  title: string;
  locales: i18nConfig["locales"];
  icon?: BaseSchemaDefinition["icon"];
}

export const localizedOrderableItem = ({
  S,
  context,
  name,
  title,
  locales,
  icon,
}: LocalizedOrderableItemOptions): ListItemBuilder => {
  // Input validation
  if (!name || typeof name !== "string") {
    throw new Error(
      "localizedOrderableItem: name parameter must be a non-empty string",
    );
  }
  if (!title || typeof title !== "string") {
    throw new Error(
      "localizedOrderableItem: title parameter must be a non-empty string",
    );
  }
  if (!Array.isArray(locales) || locales.length === 0) {
    throw new Error(
      "localizedOrderableItem: locales must be a non-empty array",
    );
  }
  if (!locales.every((locale) => locale.id && locale.title)) {
    throw new Error(
      "localizedOrderableItem: each locale must have an id and title",
    );
  }

  const pluralizedTitle = pluralize(title);

  const listItem = S.listItem()
    .title(pluralizedTitle)
    .child(
      S.list()
        .title(`${pluralizedTitle} by locale`)
        .items(
          locales.map((locale) =>
            orderableDocumentListDeskItem({
              title: `${locale.title} (${locale.id})`,
              id: `${name}_${locale.id}`,
              icon: (icon as React.ComponentType) ?? FolderIcon,
              type: name,
              filter: `_type == $type && locale == $locale`,
              params: {locale: locale.id, type: name},
              S,
              context,
              createIntent: false,
              menuItems: [
                S.menuItem()
                  .title("Create")
                  .intent({
                    type: "create",
                    params: [
                      {
                        type: name,
                        template: `${name}-${locale.id}`,
                      },
                      {
                        locale: locale.id,
                      },
                    ],
                  })
                  .showAsAction(true)
                  .serialize(),
              ],
            }),
          ),
        ),
    );

  return icon ? listItem.icon(icon) : listItem;
};
