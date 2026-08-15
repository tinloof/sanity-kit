export {createDraftModeRoute, defineDraftRoute} from "./draft-mode";
export {getRedirect, redirectIfNeeded} from "./redirect";
// Moved here from @tinloof/sanity-web when the Next.js code was split out, but
// never given an export path in either package — unreachable until now.
export {
	createSanityMetadataResolver,
	getOgImages,
	type ResolveSanityRouteMetadataProps,
	resolveSanityRouteMetadata,
} from "./resolve-sanity-metadata";
export {
	type InitSanityI18nUtilsConfig,
	type InitSanityUtilsConfig,
	initSanityI18nUtils,
	initSanityUtils,
} from "./sanity";
export {
	generateSanityI18nSitemap,
	generateSanitySitemap,
	I18N_SITEMAP_QUERY,
	SITEMAP_QUERY,
	TRANSLATIONS_FRAGMENT,
} from "./sitemap";
export {
	type DocForPath,
	formatPath,
	getDocumentPath,
	getPathVariations,
	isExternalUrl,
	type LocaleConfiguration,
	type LocalizePathnameFn,
	localizePathname,
	type MinimalDocForPath,
	pathToAbsUrl,
	removeDoubleSlashes,
	slugify,
	stringToPathname,
	stripMarginSlashes,
} from "./urls";
