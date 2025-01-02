import { Schema, SchemaTypeDefinition } from "sanity";

import { DisableCreationSchemaOptions } from "./types";

// Get all documents that have disableCreation set to true
export function getCreationDisabledDocuments(
  schema: SchemaTypeDefinition[]
): string[] | undefined {
  return schema
    ?.filter(
      ({ options }) =>
        (options as DisableCreationSchemaOptions)?.disableCreation
    )
    .map((s: { name: string }) => s.name);
}

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
