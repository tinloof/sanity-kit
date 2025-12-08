import type { ListItemBuilder, StructureBuilder } from "sanity/structure";

type SingletonListProps = {
	S: StructureBuilder;
	type: string;
	title: string;
	id?: string;
};

/**
 * Creates a singleton document list item.
 * @internal
 */
const singletonList = ({
	S,
	type,
	title,
	id = type,
}: SingletonListProps): ListItemBuilder =>
	S.listItem().title(title).child(S.document().schemaType(type).documentId(id));

export default singletonList;
