export {
  stripMarginSlashes,
  removeDoubleSlashes,
  getPathVariations,
  formatPath,
  getDocumentPath,
  localizePathname,
  stringToPathname,
  slugify,
  isExternalUrl,
  pathToAbsUrl,
  type LocaleConfiguration,
  type DocForPath,
  type MinimalDocForPath,
  type LocalizePathnameFn,
} from "./urls";

export {
  initSanityUtils,
  initSanityI18nUtils,
  type InitSanityUtilsConfig,
  type InitSanityI18nUtilsConfig,
} from "./sanity";

export {
  generateSanitySitemap,
  generateSanityI18nSitemap,
  SITEMAP_QUERY,
  I18N_SITEMAP_QUERY,
  TRANSLATIONS_FRAGMENT,
} from "./sitemap";

export {redirectIfNeeded, getRedirect} from "./redirect";

export {createDraftModeRoute, defineDraftRoute} from "./draft-mode";
