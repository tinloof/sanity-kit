import type {MetadataRoute} from "next";
import type {DefinedSanityFetchType} from "next-sanity";

import {localizePathname, pathToAbsUrl} from "../../utils/urls";
import {i18nConfig} from "../../types";
import {I18N_SITEMAP_QUERY, SITEMAP_QUERY} from "../../queries";

const HOME_TYPE = "home";

export type GenerateSanitySitemapProps = {
  websiteBaseURL: string;
  sanityFetch: DefinedSanityFetchType;
};

export type GenerateSanityI18nSitemapProps = GenerateSanitySitemapProps & {
  i18n: i18nConfig;
};

type SITEMAP_QUERYResult = {
  pathname: string | null;
  lastModified: string;
  _type: string;
};

type I18N_SITEMAP_QUERYResult = SITEMAP_QUERYResult & {
  translations: {
    pathname: string | null;
    locale: string;
  }[];
  locale: string;
};

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
        const pathname = localizePathname({
          pathname: translation?.pathname ?? "",
          localeId: translation.locale,
          isDefault: translation.locale === i18n.defaultLocaleId,
        });
        alternatesLanguages[translation.locale] =
          pathToAbsUrl({
            baseUrl,
            path: pathname,
          }) || "";
      }
      const pathname = localizePathname({
        pathname: translation?.pathname ?? "",
        localeId: i18n.defaultLocaleId,
        isDefault: true,
      });
      alternatesLanguages["x-default"] =
        pathToAbsUrl({
          baseUrl,
          path: pathname,
        }) || "";
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
