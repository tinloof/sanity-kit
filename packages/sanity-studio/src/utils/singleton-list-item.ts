import {ListItemBuilder, StructureBuilder} from "sanity/structure";

export const singletonListItem = (
  S: StructureBuilder,
  type: string,
  title: string,
  id?: string,
): ListItemBuilder =>
  S.listItem()
    .title(title)
    .child(
      S.document()
        .schemaType(type)
        .documentId(id ?? type),
    );
