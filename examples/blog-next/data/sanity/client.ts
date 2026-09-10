import {initSanity} from "@tinloof/sanity-next";

export type * as SanityTypes from "@examples/blog-studio/types";

export const {
	SanityLive,
	client,
	generateSitemap,
	redirectIfNeeded,
	resolveSanityMetadata,
	sanityFetch,
	defineEnableDraftMode,
} = initSanity();

export {default as SanityImage} from "@tinloof/sanity-next/components/sanity-image";
