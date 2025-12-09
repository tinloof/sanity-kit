import {LinkIcon} from "@sanity/icons";
import type {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured navigation field group with link icon.
 *
 * This field group is designed for organizing navigation and structure-related fields in document schemas.
 * It provides a consistent grouping structure for menus, links, breadcrumbs, and site structure.
 *
 * @returns A Sanity field group definition for navigation fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * navigationSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "page",
 *   type: "document",
 *   groups: [navigationSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "menuItems",
 *       type: "array",
 *       group: "navigation", // Fields will be grouped under "navigation"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: LinkIcon,
	name: "navigation",
	title: "Navigation",
} as FieldGroupDefinition;
