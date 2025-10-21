import {ComposeIcon} from "@sanity/icons";
import {FieldGroupDefinition} from "sanity";

/**
 * Pre-configured forms field group with form icon.
 *
 * This field group is designed for organizing form and submission-related fields in document schemas.
 * It provides a consistent grouping structure for contact forms, surveys, user submissions, and form validation.
 *
 * @returns A Sanity field group definition for forms fields
 *
 * @example
 * ```tsx
 * // Basic usage
 * formsSchemaGroup
 *
 * @example
 * ```tsx
 * // In a document schema
 * export default defineType({
 *   name: "contactForm",
 *   type: "document",
 *   groups: [formsSchemaGroup],
 *   fields: [
 *     defineField({
 *       name: "formFields",
 *       type: "array",
 *       group: "forms", // Fields will be grouped under "forms"
 *     }),
 *   ],
 * })
 * ```
 */
export default {
  icon: ComposeIcon,
  name: "forms",
  title: "Forms",
} as FieldGroupDefinition;
