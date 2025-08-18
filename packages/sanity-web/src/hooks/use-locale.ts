"use client";

import {useParams} from "next/navigation";

import {getLocale} from "../utils/locale";
import {i18nConfig} from "../types";

/**
 * A React hook that provides access to the current locale information in internationalized applications.
 *
 * Must be used within a `[locale]` route structure in your Next.js app where the locale parameter
 * is available in the URL (e.g., `/en/page` or `/es/page`).
 *
 * @param i18n - Internationalization configuration object containing locales and default locale ID
 * @returns An object containing the current locale information and whether it's the default locale
 *
 * @throws {Error} When used outside of a `[locale]` route structure
 *
 * @example
 * ```tsx
 * "use client";
 *
 * import { useLocale } from "@tinloof/sanity-web";
 * import i18n from "@/config/i18n";
 *
 * function MyComponent() {
 *   const { locale, isDefault } = useLocale(i18n);
 *
 *   return (
 *     <div>
 *       <p>Current locale: {locale.id}</p>
 *       <p>Locale title: {locale.title}</p>
 *       <p>Is default locale: {isDefault}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLocale(i18n: i18nConfig) {
  const {locale} = useParams<{locale: string}>();

  if (!locale)
    throw new Error("Only use this hook under the `[locale]` routes");

  const contextLocale = getLocale(locale, i18n.locales);

  const isDefault = contextLocale.id === i18n.defaultLocaleId;

  return {isDefault, locale: contextLocale};
}
