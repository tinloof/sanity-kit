import {defineField, defineType} from "sanity";
import {redirectsSchema, seoObjectField} from "@tinloof/sanity-studio";

export default defineType({
  name: "settings",
  type: "document",
  extends: ["singleton"],
  options: {
    localized: true,
  },
  fields: [
    defineField({
      ...seoObjectField({indexableStatus: false}),
      group: undefined,
      name: "globalSeo",
      title: "Global fallback SEO",
      description:
        "Will be used as the fallback SEO for all pages that don't define a custom SEO in their SEO fields.",
    }),
    redirectsSchema,
    {name: "locale", type: "string", hidden: true},
  ],
});
