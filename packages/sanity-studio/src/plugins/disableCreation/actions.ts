import type { DocumentActionComponent, DocumentActionsContext } from "sanity";

import type { DefaultDocumentActions } from "./types";

const defaultActions: DefaultDocumentActions[] = [
	"publish",
	"discardChanges",
	"restore",
];

// Disable creation actions for documents that have disableCreation set to true
export const actions = (
	prev: DocumentActionComponent[],
	{ schemaType }: DocumentActionsContext,
	schemas: string[],
	overrideDocumentActions?: DefaultDocumentActions[],
): DocumentActionComponent[] => {
	const isCreationDisabled = schemas.includes(schemaType);

	const documentActions = overrideDocumentActions?.length
		? overrideDocumentActions
		: defaultActions;

	return isCreationDisabled
		? prev.filter(({ action }) =>
				action ? documentActions.includes(action) : true,
			)
		: prev;
};
