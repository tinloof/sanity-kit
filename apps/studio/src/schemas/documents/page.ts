import {defineType} from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  options: {
    structureGroup: "pages",
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
    {
      name: "locale",
      type: "string",
      hidden: true,
    },
  ],
});
