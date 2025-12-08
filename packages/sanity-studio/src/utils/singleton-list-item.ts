import type { ListItemBuilder, StructureBuilder } from "sanity/structure";

export const singletonListItem = (
	S: StructureBuilder,
	type: string,
	title: string,
): ListItemBuilder =>
	S.documentTypeListItem(type).child(
		S.document().title(title).schemaType(type).views([S.view.form()]),
	);
