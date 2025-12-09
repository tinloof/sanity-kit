import {BarChartIcon} from "@sanity/icons";
import type {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured analytics field group with chart icon.
 *
 * This field group is designed for organizing analytics and tracking-related fields in document schemas.
 * It provides a consistent grouping structure for analytics data, tracking codes, performance metrics, and reporting.
 *
 * @returns A Sanity field group definition for analytics fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * analyticsSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "page",
 *   type: "document",
 *   groups: [analyticsSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "trackingCode",
 *       type: "string",
 *       group: "analytics", // Fields will be grouped under "analytics"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: BarChartIcon,
	name: "analytics",
	title: "Analytics",
} as FieldGroupDefinition;
