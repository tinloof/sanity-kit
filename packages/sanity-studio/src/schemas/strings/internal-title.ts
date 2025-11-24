import {defineField} from "sanity";

/**
 * Creates an internal title string field for document identification.
 *
 * This field is designed for internal use within Sanity Studio and won't be displayed on the website.
 * It's useful for:
 * - Organizing documents in the Studio interface
 * - Providing alternative titles for documents without public titles
 * - Internal document management and identification
 *
 * The field is automatically grouped under "settings" and includes a helpful description.
 *
 * @returns A Sanity field definition for internal title input
 *
 * @example
 * ```tsx
 * // Basic usage
 * internalTitleStringField
 * ```
 *
 * @example
 * ```tsx
 * // With custom configuration
 * defineField({
 *   ...internalTitleStringField,
 *   hidden: false, // Override default visibility
 *   validation: (Rule) => Rule.required(), // Add validation
 * })
 * ```
 */
export default defineField({
  description:
    "This title is only used internally in Sanity, it won't be displayed on the website.",
  name: "internalTitle",
  title: "Internal Title",
  type: "string",
});
