import { ColorWheelIcon } from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";

/**
 * Pre-configured theming field group with color wheel icon.
 *
 * This field group is designed for organizing theming and customization-related fields in document schemas.
 * It provides a consistent grouping structure for color schemes, theme settings, branding, and visual customization options.
 *
 * @returns A Sanity field group definition for theming fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * themingSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "theme",
 *   type: "document",
 *   groups: [themingSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "primaryColor",
 *       type: "string",
 *       group: "theming", // Fields will be grouped under "theming"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: ColorWheelIcon,
	name: "theming",
	title: "Theming",
} as FieldGroupDefinition;
