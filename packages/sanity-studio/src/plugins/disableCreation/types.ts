export type DefaultDocumentActions =
  | "publish"
  | "discardChanges"
  | "restore"
  | "unpublish"
  | "delete"
  | "duplicate";

export type DisableCreationPluginOptions = {
  schemas: string[];
  overrideDocumentActions?: DefaultDocumentActions[];
};
