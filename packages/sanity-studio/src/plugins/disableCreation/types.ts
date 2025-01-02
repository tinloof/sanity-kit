import { SchemaTypeDefinition } from "sanity";

export type DisableCreationSchemaOptions = {
  disableCreation?: boolean;
};

export type DefaultDocumentActions =
  | "publish"
  | "discardChanges"
  | "restore"
  | "unpublish"
  | "delete"
  | "duplicate";

export type DisableCreationPluginOptions = {
  schemaTypes: SchemaTypeDefinition[];
  overrideDocumentActions?: DefaultDocumentActions[];
};
