import {FolderIcon} from "@sanity/icons";
import {orderableDocumentListDeskItem} from "@sanity/orderable-document-list";
import {
  StructureBuilder,
  StructureResolver,
  StructureResolverContext,
} from "sanity/structure";

import {i18nConfig} from "../types";
import {DefineDocumentDefinition} from "./define-document";
import {localizedOrderableItem} from "./localized-orderable-item";
import {localizedSingletonItem} from "./localized-singleton-item";
import {localizedItem} from "./localizedItem";
import {pluralize} from "./pluralize";
import {singletonListItem} from "./singleton-list-item";

type DefineStructureOptions = {
  locales?: i18nConfig["locales"];
  hide?: string[];
};

export default function defineStructure(
  S: StructureBuilder,
  context: StructureResolverContext,
  options?: DefineStructureOptions,
): StructureResolver | null {
  const {
    schema: {_original},
  } = context;
  const documentSchemas = _original?.types.filter(
    ({type}) => type === "document",
  ) as DefineDocumentDefinition[];

  const {locales = [], hide = []} = options || {};

  // If no documents are found, return the default structure
  if (!documentSchemas || !documentSchemas.length) {
    console.error("No documents found");
    return () => S.defaults();
  }

  // If documents are found, but no structure is defined, return the default structure
  if (!documentSchemas.some((schema) => schema.options?.structure)) {
    console.error("No structure defined for documents");
    return () => S.defaults();
  }

  // Create title with capitalization
  function createTitle(
    schema: DefineDocumentDefinition,
    shouldPluralize = false,
  ) {
    // structure.title > schema.title > schema.name
    if (schema.options?.structure?.title) {
      return shouldPluralize
        ? pluralize(schema.options.structure.title)
        : schema.options.structure.title;
    }

    const title = schema.title || schema.name;
    const capitalizedTitle = title.charAt(0).toUpperCase() + title.slice(1);
    return shouldPluralize ? pluralize(capitalizedTitle) : capitalizedTitle;
  }

  // Create structure item for a schema
  function createSchemaItem(schema: DefineDocumentDefinition) {
    // Skip hidden schemas
    if (hide.includes(schema.name)) {
      return null;
    }

    const title = createTitle(schema);
    const icon = schema.options?.structure?.icon || schema.icon;
    const views = schema.options?.structure?.views || [];

    // Handle orderable option
    if (schema.options?.orderable) {
      if (schema.options?.structure?.singleton) {
        throw new Error(
          `Schema "${schema.name}" cannot be both singleton and orderable`,
        );
      }

      if (schema.options?.localized) {
        // Localized orderable
        if (!locales || locales.length === 0) {
          throw new Error(
            `Schema "${schema.name}" is marked as localized orderable but no locales are provided`,
          );
        }

        return localizedOrderableItem({
          S,
          context,
          name: schema.name,
          title,
          locales,
          icon,
        });
      }
      // Non-localized orderable
      const pluralizedTitle = createTitle(schema, true);
      return orderableDocumentListDeskItem({
        title: pluralizedTitle,
        icon: (icon as React.ComponentType) ?? FolderIcon,
        type: schema.name,
        S,
        context,
      });
    }

    if (schema.options?.structure?.singleton) {
      // Check if localized singleton
      if (schema.options?.localized) {
        if (!locales || locales.length === 0) {
          throw new Error(
            `Schema "${schema.name}" is marked as localized singleton but no locales are provided`,
          );
        }

        return localizedSingletonItem({
          S,
          context,
          name: schema.name,
          title,
          locales,
          icon,
          views,
        });
      }

      const singletonItem = singletonListItem(
        S,
        schema.name,
        title,
        schema.name,
        views,
      );
      return icon ? singletonItem.icon(icon) : singletonItem;
    }

    // Handle localized non-singleton items
    if (schema.options?.localized) {
      if (!locales || locales.length === 0) {
        throw new Error(
          `Schema "${schema.name}" is marked as localized but no locales are provided`,
        );
      }

      return localizedItem(S, schema.name, title, locales, icon);
    }

    const pluralizedTitle = createTitle(schema, true);
    const documentItem = S.documentTypeListItem(schema.name).title(
      pluralizedTitle,
    );
    return icon ? documentItem.icon(icon) : documentItem;
  }

  // Group schemas by their structure group option
  const groupedSchemas = documentSchemas.reduce(
    (groups, schema) => {
      const group = schema.options?.structure?.group || "Ungrouped";
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(schema);
      return groups;
    },
    {} as Record<string, DefineDocumentDefinition[]>,
  );

  const groupedItems: ReturnType<typeof createSchemaItem>[] = [];
  const ungroupedItems: ReturnType<typeof createSchemaItem>[] = [];

  Object.entries(groupedSchemas).forEach(([groupName, schemas]) => {
    // Filter out null items
    const schemaItems = schemas
      .map(createSchemaItem)
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    if (schemaItems.length === 0) {
      return; // Skip empty groups
    }

    if (groupName === "Ungrouped") {
      ungroupedItems.push(...schemaItems);
    } else {
      const groupTitle = groupName.charAt(0).toUpperCase() + groupName.slice(1);

      groupedItems.push(
        S.listItem()
          .title(groupTitle)
          .child(S.list().title(groupTitle).items(schemaItems)),
      );
    }
  });

  // Combine grouped items, divider, and ungrouped items
  const structureItems = [
    ...groupedItems,
    ...(groupedItems.length > 0 && ungroupedItems.length > 0
      ? [S.divider()]
      : []),
    ...ungroupedItems,
  ].filter((item): item is NonNullable<typeof item> => Boolean(item));

  return () => S.list().title("Structure").items(structureItems);
}
