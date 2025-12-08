import { defineQuery } from "groq";

const TRANSLATIONS_FRAGMENT = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "pathname": pathname.current,
    locale
  }
`;

export const GLOBAL_QUERY = defineQuery(`
  {
    "globalSeo": *[_type == "settings" && locale == $locale][0].globalSeo {
      title,
      description,
      image,
    },
  }`);

export const PAGE_QUERY = defineQuery(`
  *[_type == "modular.page" && pathname.current == $pathname && locale == $locale][0] {
    _type,
    sections[],
    ${TRANSLATIONS_FRAGMENT},
  }`);

export const HOME_QUERY = defineQuery(`
  *[_type == "home" && locale == $locale][0] {
    _type,
    sections[],
    ${TRANSLATIONS_FRAGMENT},
  }`);

export const STATIC_PATHS_QUERY = defineQuery(`
  *[pathname.current != null && seo.indexable && _type == "modular.page"] {
    locale,
    "pathname": pathname.current,
  }
`);
