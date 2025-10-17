import {defineField} from "sanity";

/**
 * Creates a hidden locale string field for internationalization.
 *
 * This field is used to track the locale/language of a document in internationalized setups.
 * It's automatically hidden from the UI but essential for:
 * - Document internationalization workflows
 * - Locale-specific filtering and queries
 * - Multi-language content management
 * - Integration with Sanity's document internationalization plugin
 *
 * @returns A Sanity field definition for locale tracking
 *
 * @example
 * ```tsx
 * // Basic usage in internationalized documents
 * localeStringField
 */
export default defineField({
  hidden: true,
  name: "locale",
  type: "string",
});
