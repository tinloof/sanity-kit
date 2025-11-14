import {ListItemBuilder, StructureBuilder} from "sanity/structure";

type SingletonListItemProps = {
  S: StructureBuilder;
  type: string;
  title: string;
  id?: string;
};

export const singletonListItem = ({
  S,
  type,
  title,
  id = type,
}: SingletonListItemProps): ListItemBuilder =>
  S.listItem().title(title).child(S.document().schemaType(type).documentId(id));
