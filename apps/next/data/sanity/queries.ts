import {defineQuery} from "next-sanity";

export const PAGE_QUERY = defineQuery(`*[pathname.current == $pathname][0]`);

export const HOME_QUERY = defineQuery(`*[_type == "home"][0]`);

export const GLOBAL_QUERY = defineQuery(`
  {
    "fallbackSEO": *[_type == "settings"][0].seo {
      title,
      description,
      image
    },
  }`);

export const STATIC_PATHS_QUERY = defineQuery(
  `*[_type == "page" && pathname.current != null].pathname.current`,
);
