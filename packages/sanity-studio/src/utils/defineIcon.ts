import { ComponentType } from "react";
import {
  defineField,
  FieldDefinition,
  StringInputProps,
  StringSchemaType,
} from "sanity";

import { IconSelectComponent } from "../components/IconSelectComponent";
import { IconParams } from "../types";

export function defineIcon(
  schema: IconParams = { name: "icon" }
): FieldDefinition<"string"> {
  const iconOptions = schema?.options;
  return defineField({
    ...schema,
    name: schema.name ?? "icon",
    title: schema.title ?? "Icon",
    type: "string",
    components: {
      ...schema.components,
      input: (schema.components?.input ??
        IconSelectComponent) as unknown as ComponentType<
        StringInputProps<StringSchemaType>
      >,
    },
    options: {
      ...(iconOptions ?? {}),
    },
  });
}
