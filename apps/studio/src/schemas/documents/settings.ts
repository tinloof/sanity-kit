import {defineField} from "sanity";
import {
  defineDocument,
  redirectsSchema,
  seoObjectField,
} from "@tinloof/sanity-studio";

export default defineDocument({
  name: "settings",
  title: "Settings",
  type: "document",
  options: {
    disableCreation: true,
    internalTitle: false,
  },
  fields: [
    defineField({
      ...seoObjectField({indexableStatus: false}),
      name: "globalSeo",
      title: "Global fallback SEO",
      description:
        "Will be used as the fallback SEO for all pages that don't define a custom SEO in their SEO fields.",
    }),
    redirectsSchema,
  ],
});
