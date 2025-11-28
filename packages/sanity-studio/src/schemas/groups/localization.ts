import {EarthGlobeIcon} from "@sanity/icons";
import {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured localization field group with earth globe icon.
 *
 * This field group is designed for organizing localization and translation-related fields in document schemas.
 * It provides a consistent grouping structure for multi-language content, translation management, and locale-specific settings.
 *
 * @returns A Sanity field group definition for localization fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * localizationSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "page",
 *   type: "document",
 *   groups: [localizationSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "translations",
 *       type: "array",
 *       group: "localization", // Fields will be grouped under "localization"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
  icon: EarthGlobeIcon,
  name: "localization",
  title: "Localization",
} as FieldGroupDefinition;
