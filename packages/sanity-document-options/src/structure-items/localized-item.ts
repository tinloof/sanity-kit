import { FolderIcon } from "@sanity/icons";
import pluralize from "pluralize";
import type { BaseSchemaDefinition } from "sanity";
import type { ListItemBuilder, StructureBuilder } from "sanity/structure";

import type { Locale } from "../types";

/**
 * Creates a localized document list item with locale-specific views.
 * @internal
 */
type LocalizedItemProps = {
	S: StructureBuilder;
	name: string;
	title: string;
	locales: Locale[];
	icon?: BaseSchemaDefinition["icon"];
	localeFieldName?: string;
};

const localizedItem = ({
	S,
	name,
	title,
	locales,
	icon,
	localeFieldName = "locale",
}: LocalizedItemProps): ListItemBuilder => {
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
		.title(pluralize(title))
		.icon(icon || FolderIcon)
		.child(
			S.list()
				.id(name)
				.title(`${pluralize(title)} by locale`)
				.items([
					S.listItem()
						.id(`${name}-all`)
						.title("All")
						.child(
							S.documentTypeList(name)
								.filter(`_type == $name`)
								.params({ name })
								.title(`All ${pluralize(title).toLowerCase()}`),
						),
					S.divider(),
					...locales.map((locale) =>
						S.listItem()
							.id(locale.id)
							.title(`${locale.title} (${locale.id})`)
							.child(
								S.documentTypeList(name)
									.title(`${locale.title} ${pluralize(title).toLowerCase()}`)
									.filter(`_type == $name && ${localeFieldName} == $locale`)
									.params({ locale: locale.id, name })
									.initialValueTemplates(
										S.initialValueTemplateItem(`${name}-${locale.id}`),
									),
							),
					),
				]),
		);
};

export default localizedItem;
