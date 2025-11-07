import {defineField} from "sanity";
import {
  defineDocument,
  redirectsSchema,
  seoObjectField,
} from "@tinloof/sanity-studio";
import {CogIcon} from "@sanity/icons";

export default defineDocument({
  name: "settings",
  title: "Settings",
  icon: CogIcon,
  type: "document",
  options: {
    internalTitle: false,
    structure: {singleton: true},
    localized: true,
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
