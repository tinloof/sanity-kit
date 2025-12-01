import {createClient, type ClientConfig} from "@sanity/client";
import {defineLive, type DefineSanityLiveOptions} from "next-sanity/live";
import SanityImage from "../components/sanity-image";
import {ComponentProps} from "react";
import {initSanityUtils, initSanityI18nUtils} from "../utils/sanity";
import {getVercelBaseUrl} from "../utils/vercel-base-url";
import {createSanityMetadataResolver} from "../utils/resolve-sanity-metadata";
import {defineDraftRoute, createErrorDraftRoute} from "../utils/draft-mode";

type InitSanityConfig = {
  client?: ClientConfig;
  live?: Omit<DefineSanityLiveOptions, "client">;
  baseUrl?: string;
  i18n?: Parameters<typeof initSanityI18nUtils>[0]["i18n"];
  viewerToken?: string;
};

export function initSanity(config?: InitSanityConfig) {
  const projectId = process.env["NEXT_PUBLIC_SANITY_PROJECT_ID"];
  const dataset = process.env["NEXT_PUBLIC_SANITY_DATASET"];
  const apiVersion = process.env["SANITY_API_VERSION"];

  const baseUrl = config?.baseUrl ? config.baseUrl : getVercelBaseUrl();

  if (!projectId) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_PROJECT_ID environment variable is not defined. This is required to create the Sanity client.",
    );
  }

  if (!dataset) {
    throw new Error(
      "NEXT_PUBLIC_SANITY_DATASET environment variable is not defined. This is required to create the Sanity client.",
    );
  }

  const clientConfig: ClientConfig = {
    projectId,
    dataset,
    apiVersion: apiVersion || "2025-10-01",
    useCdn: process.env.NODE_ENV === "production",
    perspective: "published",
    stega: {
      studioUrl: "/cms",
    },
    ...config?.client,
  };

  const client = createClient(clientConfig);

  const sanity_api_token =
    config?.viewerToken || process.env["SANITY_API_TOKEN"];

  if (typeof config?.live === "undefined") {
    if (!sanity_api_token) {
      throw new Error(
        "SANITY_API_TOKEN environment variable is not defined. This token is required for next-sanity/live features. Make sure it is a VIEWER token",
      );
    }

    const {sanityFetch, ...rest} = defineLive({
      browserToken: sanity_api_token,
      serverToken: sanity_api_token,
      client,
    });

    const utils =
      typeof config?.i18n === "undefined"
        ? initSanityUtils({
            sanityFetch,
            baseUrl,
          })
        : initSanityI18nUtils({sanityFetch, baseUrl, i18n: config.i18n});

    const draftClient = client.withConfig({token: sanity_api_token});
    const draftRoute = defineDraftRoute(draftClient);

    return {
      SanityImage: (
        props: Omit<ComponentProps<typeof SanityImage>, "config">,
      ) =>
        SanityImage({
          ...props,
          config: {
            dataset,
            projectId,
          },
        }),
      client,
      sanityFetch,
      resolveSanityMetadata: createSanityMetadataResolver({
        client,
        websiteBaseURL: baseUrl,
        defaultLocaleId: config?.i18n?.defaultLocaleId,
      }),
      draftRoute,
      ...utils,
      ...rest,
    };
  }

  const {sanityFetch, ...rest} = defineLive({...config.live, client});

  const utils =
    typeof config.i18n === "undefined"
      ? initSanityUtils({
          sanityFetch,
          baseUrl,
        })
      : initSanityI18nUtils({sanityFetch, baseUrl, i18n: config.i18n});

  const draftRoute = sanity_api_token
    ? defineDraftRoute(client.withConfig({token: sanity_api_token}))
    : createErrorDraftRoute(
        "Draft mode is not configured. To enable draft mode, either:\n" +
          "1. Set SANITY_API_TOKEN environment variable with a viewer token\n" +
          "2. Pass a 'viewerToken' option to initSanity({ viewerToken: 'your-token' })\n" +
          "Learn more: https://www.sanity.io/docs/draft-mode",
      );

  return {
    SanityImage: (props: Omit<ComponentProps<typeof SanityImage>, "config">) =>
      SanityImage({
        ...props,
        config: {
          dataset,
          projectId,
        },
      }),
    client,
    sanityFetch,
    resolveSanityMetadata: createSanityMetadataResolver({
      client,
      websiteBaseURL: baseUrl,
      defaultLocaleId: config.i18n?.defaultLocaleId,
    }),
    draftRoute,
    ...utils,
    ...rest,
  };
}
