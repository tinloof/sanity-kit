import {ComposeIcon} from "@sanity/icons";
import {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured content field group with compose icon.
 *
 * This field group is designed for organizing content-related fields in document schemas.
 * It provides a consistent grouping structure with appropriate iconography for content fields.
 *
 * @returns A Sanity field group definition for content fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * contentSchemaGroup
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "post",
 *   type: "document",
 *   groups: [contentSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "title",
 *       type: "string",
 *       group: "content", // Fields will be grouped under "content"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
  icon: ComposeIcon,
  name: "content",
  title: "Content",
} as FieldGroupDefinition;
