import {PinIcon} from "@sanity/icons";
import {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured location field group with location icon.
 *
 * This field group is designed for organizing location and geography-related fields in document schemas.
 * It provides a consistent grouping structure for addresses, coordinates, maps, and location-based content.
 *
 * @returns A Sanity field group definition for location fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * locationSchemaGroup
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "venue",
 *   type: "document",
 *   groups: [locationSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "address",
 *       type: "string",
 *       group: "location", // Fields will be grouped under "location"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
  icon: PinIcon,
  name: "location",
  title: "Location",
} as FieldGroupDefinition;
