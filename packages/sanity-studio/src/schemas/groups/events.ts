import { CalendarIcon } from "@sanity/icons";
import type { FieldGroupDefinition } from "sanity";

/**
 * Pre-configured events field group with calendar icon.
 *
 * This field group is designed for organizing event and scheduling-related fields in document schemas.
 * It provides a consistent grouping structure for event dates, locations, attendees, and scheduling information.
 *
 * @returns A Sanity field group definition for events fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * eventsSchemaGroup
 * ```
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "event",
 *   type: "document",
 *   groups: [eventsSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "eventDate",
 *       type: "datetime",
 *       group: "events", // Fields will be grouped under "events"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
	icon: CalendarIcon,
	name: "events",
	title: "Events",
} as FieldGroupDefinition;
