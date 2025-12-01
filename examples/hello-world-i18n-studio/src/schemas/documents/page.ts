import {defineType} from "sanity";

export default defineType({
  name: "modular.page",
  title: "Page",
  type: "document",
  extends: ["page"],
  options: {
    structureGroup: "pages",
    localized: true,
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
