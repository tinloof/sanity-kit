import {defineField, defineType} from "sanity";
import {redirectsSchema, seoObjectField} from "@tinloof/sanity-studio";

export default defineType({
  name: "settings",
  title: "Settings",
  type: "document",
  options: {
    disableCreation: true,
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
  ],
});
