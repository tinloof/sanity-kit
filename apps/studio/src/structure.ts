import {isDev} from "sanity";
import {StructureResolver} from "sanity/structure";
import {importDocumentSchemas, singletonListItem} from "@tinloof/sanity-studio";

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

const disableCreationDocuments = (await importDocumentSchemas()).filter(
  (document) => document.options?.disableCreation,
);

const disabledSingletons = () => {
  if (!isDev) {
    return [...disableCreationDocuments.map((document) => document.name)];
  }
  return [];
};

export const disableCreationDocumentTypes = [
  // Disable singletons document creation only in production
  ...disabledSingletons(),
];
