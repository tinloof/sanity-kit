import {defineType} from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  extends: ["singleton"],
  options: {
    structureGroup: "pages",
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
    {name: "sectionsBody", type: "sectionsBody"},
  ],
});
