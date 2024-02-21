import { FieldDefinition } from "sanity";
import { SectionArrayItem } from "../components";
import { SectionSchema } from "../types";

export function defineSection(schema: SectionSchema): SectionSchema {
  return {
    ...schema,
    fields: schema.fields.filter(Boolean) as FieldDefinition<"object">[],
    components: {
      ...schema.components,
      item: SectionArrayItem,
    },
  };
}
