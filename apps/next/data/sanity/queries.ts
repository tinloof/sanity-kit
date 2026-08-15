import {defineQuery} from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[pathname.current == $pathname][0]`);

export const HOME_QUERY = defineQuery(`*[_type == "home"][0]`);

// The settings document's field is `globalSeo`, not `seo`, and its image field is
// `ogImage`, not `image` — projecting the old names resolved the whole selection
// to `never` once typegen was wired up.
export const GLOBAL_QUERY = defineQuery(`
  {
    "fallbackSEO": *[_type == "settings"][0].globalSeo {
      title,
      description,
      ogImage
    },
  }`);
