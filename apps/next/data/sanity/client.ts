import {initSanity} from "@tinloof/sanity-next";

// SanityImage is not part of initSanity()'s return; it ships as its own entry.
export {default as SanityImage} from "@tinloof/sanity-next/components/sanity-image";

export const {
	SanityLive,
	client,
	generateSitemap,
	redirectIfNeeded,
	resolveSanityMetadata,
	sanityFetch,
	defineEnableDraftMode,
} = initSanity();
