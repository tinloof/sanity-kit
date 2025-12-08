export type DefaultDocumentActions =
	| "delete"
	| "discardChanges"
	| "discardVersion"
	| "duplicate"
	| "restore"
	| "publish"
	| "unpublish"
	| "unpublishVersion"
	| "linkToCanvas"
	| "editInCanvas"
	| "unlinkFromCanvas"
	| "schedule";

export type DisableCreationPluginOptions = {
	schemas: string[];
	overrideDocumentActions?: DefaultDocumentActions[];
};
