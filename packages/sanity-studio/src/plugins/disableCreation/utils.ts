import { Schema } from "sanity";

import { DisableCreationSchemaOptions } from "./types";

// Get if a document has disableCreation set to true
export function getIsCreationDisabledDocument(
  schema: Schema,
  schemaType: string
): boolean {
  const docSchema = schema._original?.types?.find(
    ({ name }) => name === schemaType
  );

  return (
    (docSchema?.options as DisableCreationSchemaOptions)?.disableCreation ??
    false
  );
}
