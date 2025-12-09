import {singletonListItem} from "@tinloof/sanity-studio";
import {isDev} from "sanity";
import type {StructureResolver} from "sanity/structure";
import documents from "./schemas/documents";

export const structure: StructureResolver = (S) => {
	return S.list()
		.title("Content")
		.items([
			singletonListItem(S, "home", "Home"),
			S.documentTypeListItem("page").title("Pages"),
			S.divider(),
			singletonListItem(S, "settings", "Settings"),
		]);
};

const disableCreationDocuments = documents.filter(
	(document) => document.options?.disableCreation,
);

const disabledSingletons = () => {
	if (isDev) {
		return [...disableCreationDocuments.map((document) => document.name)];
	}
	return [];
};

export const disableCreationDocumentTypes = [
	// Disable singletons document creation only in production
	...disabledSingletons(),
];
