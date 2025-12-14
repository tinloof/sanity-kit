import {initSanity} from "@tinloof/sanity-next";

export type * as SanityTypes from "@examples/blog-studio/types";

export const {
	SanityImage,
	SanityLive,
	client,
	generateSitemap,
	redirectIfNeeded,
	resolveSanityMetadata,
	sanityFetch,
	defineEnableDraftMode,
	loadMoreHandler,
} = initSanity();
