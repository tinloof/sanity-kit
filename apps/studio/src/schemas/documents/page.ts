import {defineType} from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
    },
  ],
});
