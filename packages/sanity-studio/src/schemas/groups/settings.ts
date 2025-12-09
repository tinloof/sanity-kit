import {CogIcon} from "@sanity/icons";
import type {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured settings field group with cog icon.
 *
 * This field group is designed for organizing settings and configuration-related fields in document schemas.
 * It provides a consistent grouping structure with appropriate iconography for settings fields.
 *
 * @returns A Sanity field group definition for settings fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * settingsSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "post",
 *   type: "document",
 *   groups: [settingsSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "seo",
 *       type: "object",
 *       group: "settings", // Fields will be grouped under "settings"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: CogIcon,
	name: "settings",
	title: "Settings",
} as FieldGroupDefinition;
