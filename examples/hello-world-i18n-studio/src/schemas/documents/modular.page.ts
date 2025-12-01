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
  preview: {
    select: {
      locale: "locale",
      title: "title",
      pathname: "pathname.current",
    },
    prepare: ({locale, pathname, title}) => ({
      title: `(${locale}) ${title}`,
      subtitle: pathname,
    }),
  },
});
