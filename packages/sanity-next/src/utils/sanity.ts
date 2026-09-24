import type {NextRequest} from "next/server";
import type {DefinedFetchType} from "./next-sanity-types";
import {type RedirectOptions, redirectIfNeeded} from "./redirect";
import {generateSanityI18nSitemap, generateSanitySitemap} from "./sitemap";
import {getPathVariations, localizePathname} from "./urls";

export type InitSanityUtilsConfig = {
	sanityFetch: DefinedFetchType;
	baseUrl: string;
	/** Override the sitemap GROQ query; i18n queries must include locale and translations. */
	sitemap?: {query?: string};
	/** Configure redirect lookup and optional exact query-string matching. */
	redirects?: RedirectOptions;
};

export type InitSanityI18nUtilsConfig = {
	sanityFetch: DefinedFetchType;
	baseUrl: string;
	/** Override the sitemap GROQ query; i18n queries must include locale and translations. */
	sitemap?: {query?: string};
	/** Configure redirect lookup and optional exact query-string matching. */
	redirects?: RedirectOptions;
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
 * const redirect = await sanityUtils.redirectIfNeeded({request});
 * ```
 */
export function initSanityUtils({
	sanityFetch,
	baseUrl,
	sitemap,
	redirects,
}: InitSanityUtilsConfig) {
	return {
		generateSitemap: () =>
			generateSanitySitemap({
				sanityFetch,
				websiteBaseURL: baseUrl,
				query: sitemap?.query,
			}),
		redirectIfNeeded: async ({request}: {request: NextRequest}) =>
			await redirectIfNeeded({request, sanityFetch, ...redirects}),
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
 * const redirect = await sanityI18nUtils.redirectIfNeeded({request});
 * const localizedPath = sanityI18nUtils.localizePathname("/about", "es");
 * ```
 */
export function initSanityI18nUtils({
	sanityFetch,
	baseUrl,
	sitemap,
	redirects,
	i18n,
}: InitSanityI18nUtilsConfig) {
	return {
		generateSitemap: () =>
			generateSanityI18nSitemap({
				sanityFetch,
				websiteBaseURL: baseUrl,
				query: sitemap?.query,
				i18n,
			}),
		redirectIfNeeded: async ({request}: {request: NextRequest}) =>
			await redirectIfNeeded({request, sanityFetch, ...redirects}),
		localizePathname,
	};
}
