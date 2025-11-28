import {defineType} from "sanity";

export default defineType({
  name: "page",
  title: "Page",
  extends: ["orderable"],
  type: "document",
  fields: [
    {
      name: "title",
      type: "string",
    },
    {name: "sectionsBody", type: "sectionsBody"},
  ],
});
