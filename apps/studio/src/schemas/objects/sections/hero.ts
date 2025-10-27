import {defineType} from "sanity";

export default defineType({
  name: "section.hero",
  title: "Hero",
  type: "object",
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
