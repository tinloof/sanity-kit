import {defineType} from "sanity";

export default defineType({
  name: "home",
  title: "Home",
  type: "document",
  extends: [
    "singleton",
    {type: "page", parameters: {pathname: {disableCreation: true}}},
  ],
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
  preview: {
    select: {
      locale: "locale",
    },
    prepare: ({locale}) => ({
      title: `(${locale}) Home`,
    }),
  },
});
