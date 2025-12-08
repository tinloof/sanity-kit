import { ImageIcon } from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";

/**
 * Pre-configured media field group with image icon.
 *
 * This field group is designed for organizing media-related fields in document schemas.
 * It provides a consistent grouping structure for images, videos, files, and other media assets.
 *
 * @returns A Sanity field group definition for media fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * mediaSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "post",
 *   type: "document",
 *   groups: [mediaSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "featuredImage",
 *       type: "image",
 *       group: "media", // Fields will be grouped under "media"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: ImageIcon,
	name: "media",
	title: "Media",
} as FieldGroupDefinition;
