import { createImageUrlBuilder } from "@sanity/image-url";
import type { ResolvedMetadata } from "next";
import type { Image, SanityClient } from "sanity";

import { localizePathname, pathToAbsUrl } from "../urls";

type Seo = {
	title?: string;
	description?: string;
	ogImage?: Omit<Image, "crop" | "hotspot">;
	indexable?: boolean;
};

type Translation = null | { locale: null | string; pathname: null | string };

type GetOgImagesProps = {
	image: Image;
	client: SanityClient;
};

/**
 * Generates Open Graph images from a Sanity image asset
 * @param props - Configuration object containing image and Sanity client
 * @returns Array of Open Graph image objects with URL and width
 */
export function getOgImages(props: GetOgImagesProps) {
	const { image, client } = props;

	const { dataset, projectId } = client.config();

	const imageBuilder = createImageUrlBuilder({
		dataset: dataset || "",
		projectId: projectId || "",
	});

	const builder = imageBuilder.image(image).fit("max").auto("format");

	return [
		{
			url: builder.width(1200).url(),
			width: 1200,
		},
	];
}

export type ResolveSanityRouteMetadataProps = {
	parent: ResolvedMetadata;
	websiteBaseURL: string;
	defaultLocaleId?: string;
	client: SanityClient;
	pathname?:
		| {
				_type: "slug";
				current?: string;
		  }
		| string;
	locale?: string;
	title?: string;
	translations?: Translation[];
	seo?: Seo;
};

/**
 * Resolves Next.js metadata from Sanity CMS content
 *
 * This function generates comprehensive metadata including SEO tags, Open Graph images,
 * canonical URLs, and internationalization support for Next.js applications.
 *
 * @param props - Configuration object for metadata resolution
 * @returns Promise resolving to Next.js metadata object
 *
 * @example
 * ```typescript
 * const metadata = await resolveSanityRouteMetadata({
 *   parent: parentMetadata,
 *   websiteBaseURL: 'https://example.com',
 *   client: sanityClient,
 *   title: 'Page Title',
 *   seo: {
 *     title: 'SEO Title',
 *     description: 'Page description',
 *     image: imageAsset
 *   },
 *   translations: [
 *     { locale: 'en', pathname: '/about' },
 *     { locale: 'fr', pathname: '/about' }
 *   ]
 * });
 * ```
 */
export async function resolveSanityRouteMetadata(
	props: ResolveSanityRouteMetadataProps,
) {
	const {
		title,
		pathname,
		seo,
		translations,
		locale,
		websiteBaseURL,
		parent,
		defaultLocaleId,
		client,
	} = props;

	// Validate required parameters
	if (!websiteBaseURL) {
		throw new Error("websiteBaseURL is required for metadata resolution");
	}
	if (!client) {
		throw new Error("Sanity client is required for metadata resolution");
	}
	if (!parent) {
		throw new Error("Parent metadata is required for metadata resolution");
	}

	// Handle pathname extraction with proper type guards
	let path = "";
	if (pathname) {
		if (typeof pathname === "string") {
			path = pathname;
		} else if (typeof pathname === "object" && pathname.current) {
			path = pathname.current;
		}
	}

	// If path is empty or null, treat it as the home page
	if (!path) {
		path = "/";
	}

	const canonicalUrl = pathToAbsUrl({
		baseUrl: websiteBaseURL,
		path: localizePathname({
			pathname: path,
			localeId: locale,
			isDefault: locale === defaultLocaleId,
		}),
	});

	// Fallback logic for ogImages:
	// 1. First try seo?.ogImage (if provided and has asset)
	// 2. Fall back to parent.openGraph?.images (if available)
	// 3. Default to empty array

	let ogImages;

	if (seo?.ogImage?.asset) {
		try {
			ogImages = getOgImages({ image: seo.ogImage, client });
		} catch (error) {
			console.warn("Failed to generate OG images from SEO image:", error);
			ogImages = parent?.openGraph?.images || [];
		}
	} else if (parent?.openGraph?.images) {
		ogImages = parent?.openGraph?.images;
	} else {
		ogImages = [];
	}

	const languages: Record<string, string> = {};

	// Handle translations if provided and not empty
	if (Array.isArray(translations) && translations.length > 0) {
		for (const translation of translations) {
			// Add locale slug if it's not the default locale
			if (translation?.locale) {
				const pathname = localizePathname({
					pathname: translation?.pathname ?? "",
					localeId: translation.locale,
					isDefault: translation.locale === defaultLocaleId,
				});
				languages[translation.locale] =
					pathToAbsUrl({
						baseUrl: websiteBaseURL,
						path: pathname,
					}) || "";
			}
		}
		languages["x-default"] =
			pathToAbsUrl({ baseUrl: websiteBaseURL, path }) || "";
	}

	return {
		alternates: {
			canonical: canonicalUrl,
			...(Object.keys(languages).length > 0 ? { languages } : {}),
		},
		...(seo?.title ? { title: seo.title } : title ? { title } : {}),
		...(seo?.description ? { description: seo.description } : {}),
		openGraph: {
			images: ogImages,
			url: canonicalUrl,
			...(seo?.title ? { title: seo.title } : title ? { title } : {}),
		},
		robots: !seo?.indexable ? "noindex nofollow" : undefined,
	};
}

/**
 * Creates a configured metadata resolver function
 *
 * This factory function returns a pre-configured metadata resolver that can be reused
 * across multiple pages without having to pass the same configuration each time.
 *
 * @param options - Configuration object with client, websiteBaseURL, and defaultLocaleId
 * @returns Configured metadata resolver function
 *
 * @example
 * ```typescript
 * const resolveMetadata = createSanityMetadataResolver({
 *   client: sanityClient,
 *   websiteBaseURL: 'https://example.com',
 *   defaultLocaleId: 'en'
 * });
 *
 * // Use in generateMetadata function
 * export async function generateMetadata(props, parentPromise) {
 *   const data = await loadPage(props.params.path);
 *   return resolveMetadata({
 *     parent: await parentPromise,
 *     title: data.title,
 *     seo: data.seo
 *   });
 * }
 * ```
 */
export function createSanityMetadataResolver(
	options: Pick<
		ResolveSanityRouteMetadataProps,
		"client" | "websiteBaseURL" | "defaultLocaleId"
	>,
) {
	const { client, websiteBaseURL, defaultLocaleId } = options;

	// Validate required configuration
	if (!client) {
		throw new Error("Sanity client is required for metadata resolver");
	}
	if (!websiteBaseURL) {
		throw new Error("websiteBaseURL is required for metadata resolver");
	}

	return async function resolveRouteMetadata(
		props: Omit<
			ResolveSanityRouteMetadataProps,
			"client" | "websiteBaseURL" | "defaultLocaleId"
		>,
	) {
		return resolveSanityRouteMetadata({
			...props,
			client,
			websiteBaseURL,
			defaultLocaleId,
		});
	};
}
