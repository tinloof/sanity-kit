import {isDev} from "sanity";
import documents from "./schemas/documents";
import {StructureResolver} from "sanity/structure";
import {
  DefineDocumentDefinition,
  singletonListItem,
} from "@tinloof/sanity-studio";

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

const disableCreationDocuments = documents.filter((document) => {
  const schema = document as DefineDocumentDefinition;
  return schema.options?.disableCreation;
});

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
