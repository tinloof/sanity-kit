import type {MetadataRoute} from "next/dist/types";
import {defineQuery} from "next-sanity";
import type {DefinedFetchType} from "./next-sanity-types";
import {formatPath, localizePathname} from "./urls";

interface GenerateSanitySitemapProps {
	sanityFetch: DefinedFetchType;
	websiteBaseURL: string;
	/** Custom GROQ query returning the documented sitemap route shape. */
	query?: string;
}

interface GenerateSanityI18nSitemapProps {
	sanityFetch: DefinedFetchType;
	websiteBaseURL: string;
	/** Custom GROQ query returning the documented sitemap route shape. */
	query?: string;
	i18n: {
		locales: Array<{id: string; title: string}>;
		defaultLocaleId: string;
	};
}

export function pathToAbsUrl(args: {
	path: string;
	baseUrl: string;
}): string | undefined {
	const path = args?.path;

	if (typeof path !== "string") return;

	return (
		args.baseUrl +
		// When creating absolute URLs, ensure the homepage doesn't have a trailing slash
		(path === "/" ? "" : formatPath(path))
	);
}

type SITEMAP_QUERYResult = {
	pathname: string | null;
	lastModified?: string | null;
	_type: string;
};

export const SITEMAP_QUERY = defineQuery(`
  *[((pathname.current != null || _type == $homeType) && seo.indexable)] {
    "pathname": pathname.current,
    "lastModified": _updatedAt,
    _type,
  }`);

const HOME_TYPE = "home";

export async function generateSanitySitemap({
	sanityFetch,
	websiteBaseURL,
	query = SITEMAP_QUERY,
}: GenerateSanitySitemapProps) {
	// next-sanity 13 resolves `data` through `ClientReturn<Query, unknown>`, which
	// falls back to `unknown` for queries absent from the consumer's generated
	// `SanityQueries`. Custom queries must return the documented route shape.
	const {data: routes} = (await sanityFetch({
		query,
		params: {
			homeType: HOME_TYPE,
		},
		perspective: "published",
		stega: false,
	})) as {data: SITEMAP_QUERYResult[]};

	return (
		routes?.map((route) => {
			const isHomePage = route._type === HOME_TYPE;
			const baseUrl = websiteBaseURL;
			let url = websiteBaseURL;
			if (isHomePage) {
				url = pathToAbsUrl({baseUrl, path: "/"}) ?? baseUrl;
			} else {
				url = `${baseUrl}${route?.pathname ?? ""}`;
			}
			return {
				lastModified: route.lastModified || undefined,
				url,
			};
		}) ?? []
	);
}

export const TRANSLATIONS_FRAGMENT = /* groq */ `
  "translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
    "pathname": pathname.current,
    locale
  }
`;

export const I18N_SITEMAP_QUERY = defineQuery(`
  *[(pathname.current != null || _type == $homeType) && seo.indexable && locale == $locale] {
    "pathname": pathname.current,
    "lastModified": _updatedAt,
    _type,
    locale,
    ${TRANSLATIONS_FRAGMENT},
  }`);

type I18N_SITEMAP_QUERYResult = SITEMAP_QUERYResult & {
	translations: {
		pathname: string | null;
		locale: string;
	}[];
	locale: string;
};

export async function generateSanityI18nSitemap({
	websiteBaseURL,
	sanityFetch,
	i18n,
	query,
}: GenerateSanityI18nSitemapProps): Promise<MetadataRoute.Sitemap> {
	const allRoutes: I18N_SITEMAP_QUERYResult[] = [];

	// Fetch all routes for all locales
	await Promise.all(
		i18n.locales.map(async (locale) => {
			const {data: routes} = (await sanityFetch({
				query: query ?? I18N_SITEMAP_QUERY,
				perspective: "published",
				stega: false,
				params: {
					locale: locale.id,
					homeType: HOME_TYPE,
				},
			})) as {data: I18N_SITEMAP_QUERYResult[]};
			if (query !== undefined) {
				if (
					!Array.isArray(routes) ||
					routes.some(
						(route) =>
							!route ||
							route.locale !== locale.id ||
							!Array.isArray(route.translations),
					)
				) {
					throw new Error(
						`Custom i18n sitemap query must return an array of routes with locale "${locale.id}" and a translations array. Filter by $locale and project locale and translations.`,
					);
				}
			}
			if (routes) allRoutes.push(...routes);
		}),
	);

	return allRoutes?.map((route) => {
		const alternatesLanguages: Record<string, string> = {};
		const isHomePage = route._type === HOME_TYPE;
		const baseUrl = websiteBaseURL;

		let url = websiteBaseURL;

		if (isHomePage) {
			url =
				i18n.defaultLocaleId === route.locale
					? `${baseUrl}`
					: `${baseUrl}/${route.locale}`;
		} else {
			url = `${baseUrl}${
				localizePathname({
					pathname: route?.pathname ?? "/",
					localeId: route?.locale ?? i18n.defaultLocaleId,
					isDefault: route?.locale === i18n.defaultLocaleId,
				}) || ""
			}`;
		}

		for (const translation of route.translations) {
			// Add locale slug if it's not the default locale
			if (translation?.locale) {
				const translationPathname = localizePathname({
					pathname: translation?.pathname ?? "",
					localeId: translation.locale,
					isDefault: translation.locale === i18n.defaultLocaleId,
				});
				if (translationPathname) {
					const translationUrl = pathToAbsUrl({
						baseUrl,
						path: translationPathname,
					});
					if (translationUrl && translation?.locale) {
						alternatesLanguages[translation.locale] = translationUrl;
					}
				}
			}
		}

		const defaultPathname = localizePathname({
			pathname: route?.pathname ?? "",
			localeId: i18n.defaultLocaleId,
			isDefault: true,
		});
		if (defaultPathname) {
			const defaultUrl = pathToAbsUrl({
				baseUrl,
				path: defaultPathname,
			});
			if (defaultUrl) {
				alternatesLanguages["x-default"] = defaultUrl;
			}
		}

		return {
			alternates: {
				languages: alternatesLanguages,
			},
			lastModified: route.lastModified || undefined,
			url,
		};
	});
}
