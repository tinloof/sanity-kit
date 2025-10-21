import {defineQuery} from "next-sanity";
import {TRANSLATIONS_FRAGMENT} from "../fragments";

/**
 * GROQ query to fetch redirect configuration from Sanity.
 *
 * This query looks for a settings document and finds the first redirect
 * where the source path matches any of the provided path variations.
 */
export const REDIRECT_QUERY = defineQuery(`
  *[_type == "settings"][0].redirects[@.source in $paths][0]`);

/**
 * GROQ query to fetch i18n sitemap configuration from Sanity.
 *
 * This query looks for all documents that are indexable and have a pathname or are of type "home" and have a locale.
 */
export const I18N_SITEMAP_QUERY = defineQuery(`
  *[(pathname.current != null || _type == $homeType) && seo.indexable && locale == $locale] {
    "pathname": pathname.current,
    "lastModified": _updatedAt,
    _type,
    locale,
    ${TRANSLATIONS_FRAGMENT},
  }`);

/**
 * GROQ query to fetch sitemap configuration from Sanity.
 *
 * This query looks for all documents that are indexable and have a pathname or are of type "home".
 */
export const SITEMAP_QUERY = defineQuery(`
  *[((pathname.current != null || _type == $homeType) && seo.indexable)] {
    "pathname": pathname.current,
    "lastModified": _updatedAt,
    _type,
  }`);
