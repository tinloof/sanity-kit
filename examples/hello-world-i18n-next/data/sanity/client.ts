import {initSanity} from "@tinloof/sanity-next";

const locales = [
  {id: "en", title: "English"},
  {id: "fr", title: "Français"},
];

export const {
  SanityImage,
  SanityLive,
  client,
  generateSitemap,
  redirectIfNeeded,
  resolveSanityMetadata,
  sanityFetch,
} = initSanity({
  i18n: {
    locales,
    defaultLocaleId: locales[0].id,
  },
});
