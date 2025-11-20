import {defineLocaleResourceBundle} from "sanity";

/**
 * The locale namespace for the document i18n plugin.
 *
 * @public
 */
export const documentI18nLocaleNamespace = "document-i18n" as const;

/**
 * The default locale bundle for the document i18n plugin, which is US English.
 *
 * @internal
 */
export const documentI18nUsEnglishLocaleBundle = defineLocaleResourceBundle({
  locale: "en-US",
  namespace: documentI18nLocaleNamespace,
  resources: () => import("./resources"),
});
