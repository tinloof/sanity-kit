import { Template } from "sanity";
import { SchemaTypeDefinition } from "sanity";

import { getCreationDisabledDocuments } from "./utils";

export default function getTemplates(
  templates: Template[],
  schemaTypes: SchemaTypeDefinition[]
): Template[] {
  return templates?.filter(
    (template) =>
      !getCreationDisabledDocuments(schemaTypes)?.includes(template.schemaType)
  );
}
