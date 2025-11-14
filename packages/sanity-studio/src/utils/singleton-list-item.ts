import {
  ListItemBuilder,
  StructureBuilder,
  View,
  ViewBuilder,
} from "sanity/structure";

export const singletonListItem = (
  S: StructureBuilder,
  type: string,
  title: string,
  id?: string,
  views?:
    | (View | ViewBuilder)[]
    // eslint-disable-next-line no-shadow
    | ((S: StructureBuilder) => (View | ViewBuilder)[]),
): ListItemBuilder =>
  S.listItem()
    .title(title)
    .child(
      S.document()
        .schemaType(type)
        .documentId(id ?? type)
        .views(typeof views === "function" ? views(S) : (views ?? [])),
    );
