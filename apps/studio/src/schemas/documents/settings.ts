import {defineDocument, redirectsSchema} from "@tinloof/sanity-studio";

export default defineDocument({
  name: "settings",
  title: "Settings",
  type: "document",
  options: {
    disableCreation: true,
    hideInternalTitle: true,
    localized: true,
  },
  fields: [
    {
      title: "Global fallback SEO",
      description:
        "Will be used as the fallback SEO for all pages that don't define a custom SEO in their SEO fields.",
      name: "seo",
      type: "seo",
    },
    {...redirectsSchema},
  ],
});
