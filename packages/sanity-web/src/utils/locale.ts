import {Locale} from "../types";

/**
 * Retrieves a locale object from a list of locales based on locale ID.
 *
 * @param locale - The locale ID to search for
 * @param locales - Array of locale objects to search in
 * @returns The matching locale object, or the first locale in the array if no match is found
 *
 * @example
 * ```ts
 * const locales = [
 *   { id: "en", title: "English" },
 *   { id: "es", title: "Spanish" }
 * ];
 *
 * const currentLocale = getLocale("es", locales);
 * // Returns: { id: "es", title: "Spanish" }
 *
 * const fallbackLocale = getLocale("nonexistent", locales);
 * // Returns: { id: "en", title: "English" } (first locale)
 * ```
 */
export function getLocale(locale: string, locales: Locale[]) {
  return locales.find((l) => l.id === locale) || locales[0];
}
