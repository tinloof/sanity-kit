import {ShareIcon} from "@sanity/icons";
import type {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured social field group with share icon.
 *
 * This field group is designed for organizing social media and sharing-related fields in document schemas.
 * It provides a consistent grouping structure for social links, sharing settings, social proof, and social media integration.
 *
 * @returns A Sanity field group definition for social fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * socialSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "post",
 *   type: "document",
 *   groups: [socialSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "socialLinks",
 *       type: "array",
 *       group: "social", // Fields will be grouped under "social"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: ShareIcon,
	name: "social",
	title: "Social",
} as FieldGroupDefinition;
