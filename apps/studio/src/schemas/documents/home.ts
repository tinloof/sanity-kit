import {defineType} from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  options: {
    disableCreation: true,
  },
  fields: [
    {
      name: "title",
      type: "string",
    },
    {
      name: "locale",
      type: "string",
    },
  ],
});
