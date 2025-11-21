import {defineQuery} from "next-sanity";
import {type DefinedSanityFetchType} from "next-sanity/live";
import {generateSanitySitemap, generateSanityI18nSitemap} from "./sitemap";
import {getPathVariations, localizePathname} from "./urls";

export type InitSanityUtilsConfig = {
  sanityFetch: DefinedSanityFetchType;
  baseUrl: string;
};

export type InitSanityI18nUtilsConfig = {
  sanityFetch: DefinedSanityFetchType;
  baseUrl: string;
  i18n: {
    locales: Array<{id: string; title: string}>;
    defaultLocaleId: string;
  };
};

/**
 * Redirect configuration returned from Sanity.
 */
export type RedirectData = {
  /** The source path that triggers the redirect */
  source: string;
  /** The destination URL to redirect to */
  destination: string;
  /** Whether this is a permanent or temporary redirect */
  permanent: boolean;
} | null;

/**
 * GROQ query to fetch redirect configuration from Sanity.
 */
const REDIRECT_QUERY = defineQuery(`
  *[_type == "settings"][0].redirects[@.source in $paths][0]`);

/**
 * Initialize Sanity utilities with pre-configured functions
 *
 * @example
 * ```ts
 * const sanityUtils = initSanityUtils({
 *   sanityFetch,
 *   baseUrl: "https://example.com",
 * });
 *
 * const sitemap = await sanityUtils.generateSitemap();
 * const redirect = await sanityUtils.getRedirect("/old-page");
 * ```
 */
export function initSanityUtils({sanityFetch, baseUrl}: InitSanityUtilsConfig) {
  return {
    generateSitemap: () =>
      generateSanitySitemap({
        sanityFetch,
        websiteBaseURL: baseUrl,
      }),
    getRedirect: async (source: string, query?: string) => {
      const paths = getPathVariations(source);

      const {data} = await sanityFetch({
        params: {paths},
        query: query || REDIRECT_QUERY,
        perspective: "published",
        stega: false,
      });

      return data as RedirectData;
    },
  };
}

/**
 * Initialize Sanity utilities with i18n support and pre-configured functions
 *
 * @example
 * ```ts
 * const sanityI18nUtils = initSanityI18nUtils({
 *   sanityFetch,
 *   baseUrl: "https://example.com",
 *   i18n: {
 *     locales: [
 *       { id: "en", title: "English" },
 *       { id: "es", title: "Español" },
 *     ],
 *     defaultLocaleId: "en",
 *   },
 * });
 *
 * const sitemap = await sanityI18nUtils.generateSitemap();
 * const redirect = await sanityI18nUtils.getRedirect("/old-page");
 * const localizedPath = sanityI18nUtils.localizePathname("/about", "es");
 * ```
 */
export function initSanityI18nUtils({
  sanityFetch,
  baseUrl,
  i18n,
}: InitSanityI18nUtilsConfig) {
  return {
    generateSitemap: () =>
      generateSanityI18nSitemap({
        sanityFetch,
        websiteBaseURL: baseUrl,
        i18n,
      }),
    getRedirect: async (source: string, query?: string) => {
      const paths = getPathVariations(source);

      const {data} = await sanityFetch({
        params: {paths},
        query: query || REDIRECT_QUERY,
        perspective: "published",
        stega: false,
      });

      return data as RedirectData;
    },
    localizePathname,
  };
}
