import {FolderIcon} from "@sanity/icons";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import pluralize from "pluralize";
import * as React from "react";
import {BaseSchemaDefinition} from "sanity";
import {
  ListItemBuilder,
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import {Locale} from "../types";

/**
 * Creates a localized orderable document list item with locale-specific drag-and-drop ordering.
 * @internal
 */
export type LocalizedOrderableItemOptions = {
  S: StructureBuilder;
  context: StructureResolverContext;
  name: string;
  title: string;
  locales: Locale[];
  icon?: BaseSchemaDefinition["icon"];
  localeFieldName?: string;
};

const localizedOrderableItem = ({
  S,
  context,
  name,
  title,
  locales,
  icon,
  localeFieldName = "locale",
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

  return S.listItem()
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
              filter: `_type == $type && ${localeFieldName} == $locale`,
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
    )
    .icon(icon);
};

export default localizedOrderableItem;
