import {defineField, FieldDefinition} from "sanity";

import {InputWithCharacterCount} from "../../components";
import {FieldOptions} from "../../types";

/**
 * Configuration options for the SEO object field
 */
type SEOObjectProps = {
  /** Hide the entire SEO field */
  hidden?: boolean;
  /** Control the indexable status field visibility */
  indexableStatus?: FieldOptions;
  /** Control the SEO title field visibility */
  title?: FieldOptions;
  /** Control the SEO description field visibility */
  description?: FieldOptions;
  /** Control the social sharing image field visibility */
  ogImage?: FieldOptions;
};

/**
 * Creates a comprehensive SEO object field with configurable sub-fields.
 *
 * This field includes:
 * - Indexable status (boolean) - Controls search engine indexing
 * - SEO title (string) - With character count validation (15-70 chars)
 * - SEO description (text) - With character count validation (50-160 chars)
 * - Social sharing image (image) - For Open Graph and social media
 *
 * @param props - Configuration options for the SEO field
 * @returns A Sanity field definition for SEO settings
 *
 * @example
 * ```tsx
 * // Basic usage with all fields visible
 * seoObjectField()
 *
 * @example
 * ```tsx
 * // Hide specific fields
 * seoObjectField({
 *   hidden: false,
 *   indexableStatus: "hidden", // Hide but keep field
 *   title: false, // Completely remove title field
 *   description: true, // Show description field
 *   ogImage: "hidden", // Hide but keep field
 * })
 * ```
 */
export default function seoObjectField({
  hidden = false,
  indexableStatus = true,
  title = true,
  description = true,
  ogImage = true,
}: SEOObjectProps): FieldDefinition {
  return defineField({
    name: "seo",
    title: "SEO",
    type: "object",
    group: "settings",
    hidden,
    options: {collapsed: false, collapsible: true},
    fields: [
      ...(indexableStatus !== false
        ? [
            defineField({
              description:
                "Won't show up in search engines if set to false, but accessible through URL.",
              initialValue: true,
              name: "indexable",
              type: "boolean",
              validation:
                indexableStatus === "hidden" || hidden
                  ? undefined
                  : (Rule) => Rule.required(),
              hidden: indexableStatus === "hidden",
            }),
          ]
        : []),
      ...(title !== false
        ? [
            defineField({
              components: {
                input: InputWithCharacterCount,
              },
              name: "title",
              options: {
                maxLength: 70,
                minLength: 15,
              },
              type: "string",
              hidden: title === "hidden",
            }),
          ]
        : []),
      ...(description !== false
        ? [
            defineField({
              components: {
                input: InputWithCharacterCount,
              },
              name: "description",
              options: {
                maxLength: 160,
                minLength: 50,
              },
              title:
                "Short description for SEO & social sharing (meta description)",
              type: "text",
              rows: 2,
              hidden: description === "hidden",
            }),
          ]
        : []),
      ...(ogImage !== false
        ? [
            defineField({
              description:
                "Highly encouraged for increasing conversion rates for links to this page shared in social media.",
              name: "ogImage",
              options: {
                hotspot: true,
              },
              title: "Social Sharing Image",
              type: "image",
              hidden: ogImage === "hidden",
            }),
          ]
        : []),
    ],
  });
}
