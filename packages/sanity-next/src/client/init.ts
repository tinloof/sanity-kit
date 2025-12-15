import {type ClientConfig, createClient} from "@sanity/client";
import {type DefineSanityLiveOptions, defineLive} from "next-sanity/live";
import type {ComponentProps} from "react";
import SanityImage from "../components/sanity-image";
import {createErrorDraftRoute, defineDraftRoute} from "../utils/draft-mode";
import {createSanityMetadataResolver} from "../utils/resolve-sanity-metadata";
import {initSanityI18nUtils, initSanityUtils} from "../utils/sanity";
import {getVercelBaseUrl} from "../utils/vercel-base-url";

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
			client: client.withConfig({token: sanity_api_token}),
		});

		const utils =
			typeof config?.i18n === "undefined"
				? initSanityUtils({
						sanityFetch,
						baseUrl,
					})
				: initSanityI18nUtils({sanityFetch, baseUrl, i18n: config.i18n});

		const clientWithToken = client.withConfig({token: sanity_api_token});
		const defineEnableDraftMode = defineDraftRoute(clientWithToken).GET;

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
			clientWithToken,
			defineEnableDraftMode,
			...utils,
			...rest,
		};
	}

	const clientWithToken = client.withConfig({token: sanity_api_token});

	const {sanityFetch, ...rest} = defineLive({
		browserToken: sanity_api_token,
		serverToken: sanity_api_token,
		...config.live,
		client: clientWithToken,
	});

	const utils =
		typeof config.i18n === "undefined"
			? initSanityUtils({
					sanityFetch,
					baseUrl,
				})
			: initSanityI18nUtils({sanityFetch, baseUrl, i18n: config.i18n});

	const defineEnableDraftMode = sanity_api_token
		? defineDraftRoute(clientWithToken).GET
		: createErrorDraftRoute(
				"Draft mode is not configured. To enable draft mode, either:\n" +
					"1. Set SANITY_API_TOKEN environment variable with a viewer token\n" +
					"2. Pass a 'viewerToken' option to initSanity({ viewerToken: 'your-token' })\n" +
					"Learn more: https://www.sanity.io/docs/draft-mode",
			).GET;

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
		defineEnableDraftMode,
		clientWithToken,
		...utils,
		...rest,
	};
}
