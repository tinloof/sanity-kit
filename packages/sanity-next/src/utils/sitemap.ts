import {defineQuery} from "next-sanity";
import {type DefinedSanityFetchType} from "next-sanity/live";
import {formatPath, localizePathname} from "./urls";
import {MetadataRoute} from "next/dist/types";

interface GenerateSanitySitemapProps {
  sanityFetch: DefinedSanityFetchType;
  websiteBaseURL: string;
}

interface GenerateSanityI18nSitemapProps {
  sanityFetch: DefinedSanityFetchType;
  websiteBaseURL: string;
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
  lastModified: string;
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
}: GenerateSanitySitemapProps) {
  const {data: routes}: {data: SITEMAP_QUERYResult[]} = await sanityFetch({
    query: SITEMAP_QUERY,
    params: {
      homeType: HOME_TYPE,
    },
    perspective: "published",
    stega: false,
  });

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
}: GenerateSanityI18nSitemapProps): Promise<MetadataRoute.Sitemap> {
  const allRoutes: I18N_SITEMAP_QUERYResult[] = [];

  // Fetch all routes for all locales
  await Promise.all(
    i18n.locales.map(async (locale) => {
      const {data: routes}: {data: I18N_SITEMAP_QUERYResult[]} =
        await sanityFetch({
          query: I18N_SITEMAP_QUERY,
          perspective: "published",
          stega: false,
          params: {
            locale: locale.id,
            homeType: HOME_TYPE,
          },
        });
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

    console.log("url", url);

    return {
      alternates: {
        languages: alternatesLanguages,
      },
      lastModified: route.lastModified || undefined,
      url,
    };
  });
}
