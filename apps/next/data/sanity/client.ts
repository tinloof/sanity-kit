import {initSanity} from "@tinloof/sanity-next";

export const {
	SanityImage,
	SanityLive,
	client,
	generateSitemap,
	redirectIfNeeded,
	resolveSanityMetadata,
	sanityFetch,
	defineEnableDraftMode,
} = initSanity();
