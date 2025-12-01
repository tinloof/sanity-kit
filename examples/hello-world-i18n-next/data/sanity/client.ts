import {initSanity} from "@tinloof/sanity-next";

export const {
  SanityLive,
  client,
  generateSitemap,
  redirectIfNeeded,
  resolveSanityMetadata,
  sanityFetch,
} = initSanity();
