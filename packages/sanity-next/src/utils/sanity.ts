import {type DefinedSanityFetchType} from "next-sanity/live";
import {generateSanitySitemap, generateSanityI18nSitemap} from "./sitemap";
import {getPathVariations, localizePathname} from "./urls";
import {NextRequest} from "next/server";
import {redirectIfNeeded} from "./redirect";

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
    redirectIfNeeded: async ({request}: {request: NextRequest}) =>
      await redirectIfNeeded({request, sanityFetch}),
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
    redirectIfNeeded: async ({request}: {request: NextRequest}) =>
      await redirectIfNeeded({request, sanityFetch}),
    localizePathname,
  };
}
