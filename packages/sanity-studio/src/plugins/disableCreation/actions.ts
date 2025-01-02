import { DocumentActionComponent, DocumentActionsContext } from "sanity";

import { DefaultDocumentActions } from "./types";
import { getIsCreationDisabledDocument } from "./utils";

const defaultActions: DefaultDocumentActions[] = [
  "publish",
  "discardChanges",
  "restore",
];

// Disable creation actions for documents that have disableCreation set to true
export const actions = (
  prev: DocumentActionComponent[],
  { schema, schemaType }: DocumentActionsContext,
  overrideDocumentActions?: DefaultDocumentActions[]
): DocumentActionComponent[] => {
  const isCreationDisabled = getIsCreationDisabledDocument(schema, schemaType);

  const documentActions = overrideDocumentActions?.length
    ? overrideDocumentActions
    : defaultActions;

  return isCreationDisabled
    ? prev.filter(({ action }) =>
        action ? documentActions.includes(action) : true
      )
    : prev;
};
