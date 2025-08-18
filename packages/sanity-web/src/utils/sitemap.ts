import type {MetadataRoute} from "next";
import type {DefinedSanityFetchType} from "next-sanity";

import {localizePathname, pathToAbsUrl} from "./urls";
import {i18nConfig} from "../types";

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

export async function GenerateSanitySitemap({
  sanityFetch,
  websiteBaseURL,
}: GenerateSanitySitemapProps) {
  const SITEMAP_QUERY = /* groq */ `
    *[((pathname.current != null || _type == "home") && indexable)] {
      "pathname": pathname.current,
      "lastModified": _updatedAt,
      _type,
    }`;

  const {data: routes}: {data: SITEMAP_QUERYResult[]} = await sanityFetch({
    query: SITEMAP_QUERY,
    perspective: "published",
    stega: false,
  });

  return (
    routes?.map((route) => {
      const isHomePage = route._type === "home";
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

export async function GenerateSanityI18nSitemap({
  websiteBaseURL,
  sanityFetch,
  i18n,
}: GenerateSanityI18nSitemapProps): Promise<MetadataRoute.Sitemap> {
  const I18N_SITEMAP_QUERY = /* groq */ `
    *[(pathname.current != null || _type == "home") && indexable && locale == $locale] {
      "pathname": pathname.current,
      "lastModified": _updatedAt,
      _type,
      locale,
      "translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
        "pathname": pathname.current,
        locale,
      },
    }`;

  const allRoutes: I18N_SITEMAP_QUERYResult[] = [];

  await Promise.all(
    i18n.locales.map(async (locale) => {
      const {data: routes}: {data: I18N_SITEMAP_QUERYResult[]} =
        await sanityFetch({
          query: I18N_SITEMAP_QUERY,
          perspective: "published",
          stega: false,
          params: {
            locale: locale.id,
          },
        });
      if (routes) allRoutes.push(...routes);
    }),
  );

  const uniqueRoutes = Array.from(
    new Map(allRoutes.map((r) => [`${r.pathname}-${r.locale}`, r])).values(),
  );

  return (
    uniqueRoutes.filter(Boolean)?.map((route) => {
      const alternatesLanguages: Record<string, string> = {};
      const isHomePage = route._type === "home";
      const baseUrl = websiteBaseURL;

      let url: string;

      if (isHomePage) {
        url = localizePathname({
          pathname: "/",
          localeId: route.locale,
          isDefault: route.locale === i18n.defaultLocaleId,
        })
          ? pathToAbsUrl({
              baseUrl,
              path: localizePathname({
                pathname: "/",
                localeId: route.locale,
                isDefault: route.locale === i18n.defaultLocaleId,
              }),
            }) || ""
          : baseUrl;
      } else {
        url =
          pathToAbsUrl({
            baseUrl,
            path:
              localizePathname({
                pathname: route.pathname ?? "",
                localeId: route.locale,
                isDefault: route.locale === i18n.defaultLocaleId,
              }) || "",
          }) || "";
      }

      const currentRoutePathname = localizePathname({
        pathname: isHomePage ? "/" : (route.pathname ?? ""),
        localeId: route.locale,
        isDefault: route.locale === i18n.defaultLocaleId,
      });

      alternatesLanguages[route.locale] =
        pathToAbsUrl({baseUrl, path: currentRoutePathname}) || "";

      if (route.translations?.length) {
        for (const translation of route.translations) {
          if (
            translation.pathname !== null &&
            translation.locale !== route.locale
          ) {
            const pathname = localizePathname({
              pathname: translation.pathname ?? (isHomePage ? "/" : ""),
              localeId: translation.locale,
              isDefault: translation.locale === i18n.defaultLocaleId,
            });

            alternatesLanguages[translation.locale] =
              pathToAbsUrl({baseUrl, path: pathname}) || "";
          }
        }
      }

      alternatesLanguages["x-default"] =
        alternatesLanguages[i18n.defaultLocaleId];

      return {
        alternates: {
          languages: alternatesLanguages,
        },
        lastModified: route.lastModified || undefined,
        url,
      };
    }) ?? []
  );
}
