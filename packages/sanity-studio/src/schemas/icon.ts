import { ComponentType } from "react";
import { defineField, StringInputProps, StringSchemaType } from "sanity";

import { IconSelectComponent } from "../components/IconSelectComponent";

export default defineField({
  name: "icon",
  title: "Icon",
  type: "string",
  components: {
    input: IconSelectComponent as unknown as ComponentType<
      StringInputProps<StringSchemaType>
    >,
  },
});
