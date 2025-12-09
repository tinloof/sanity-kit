import {FolderIcon} from "@sanity/icons";
import type {BaseSchemaDefinition} from "sanity";
import type {ListItemBuilder, StructureBuilder} from "sanity/structure";

export type Locale = {
	id: string;
	title: string;
	[key: string]: unknown;
};

export const localizedItem = (
	S: StructureBuilder,
	name: string,
	title: string,
	locales: Locale[],
	icon?: BaseSchemaDefinition["icon"],
): ListItemBuilder => {
	// Input validation
	if (!name || typeof name !== "string") {
		throw new Error("localizedItem: name parameter must be a non-empty string");
	}
	if (!title || typeof title !== "string") {
		throw new Error(
			"localizedItem: title parameter must be a non-empty string",
		);
	}
	if (!Array.isArray(locales) || locales.length === 0) {
		throw new Error("localizedItem: locales must be a non-empty array");
	}
	if (!locales.every((locale) => locale.id && locale.title)) {
		throw new Error("localizedItem: each locale must have an id and title");
	}

	return S.listItem()
		.title(title)
		.icon(icon || FolderIcon)
		.child(
			S.list()
				.id(name)
				.title(`${title} by locale`)
				.items([
					S.listItem()
						.id(`${name}-all`)
						.title("All")
						.child(
							S.documentTypeList(name).filter(`_type == $name`).params({name}),
						),
					S.divider(),
					...locales.map((locale) =>
						S.listItem()
							.id(locale.id)
							.title(locale.title)
							.child(
								S.documentTypeList(name)
									.filter(`_type == $name && locale == $locale`)
									.params({locale: locale.id, name}),
							),
					),
				]),
		);
};
