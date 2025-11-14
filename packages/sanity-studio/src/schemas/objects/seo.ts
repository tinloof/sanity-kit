import {defineField, FieldDefinition} from "sanity";

import {
  applyFieldCustomization,
  FieldCustomization,
} from "../../utils/apply-field-customization";
import {indexableBooleanField} from "../booleans";
import {ogImageField} from "../images";
import {seoDescriptionStringField, seoTitleStringField} from "../strings";

/**
 * Configuration options for the SEO object field
 */
type SEOObjectProps = {
  /** Control the indexable status field visibility */
  indexableStatus?: FieldCustomization<typeof indexableBooleanField>;
  /** Control the SEO title field visibility */
  title?: FieldCustomization<typeof seoTitleStringField>;
  /** Control the SEO description field visibility */
  description?: FieldCustomization<typeof seoDescriptionStringField>;
  /** Control the social sharing image field visibility */
  ogImage?: FieldCustomization<typeof ogImageField>;
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
 *   indexableStatus: "hidden", // Hide but keep field
 *   title: false, // Completely remove title field
 *   description: true, // Show description field
 *   ogImage: "hidden", // Hide but keep field
 * })
 * ```
 */
export default function seoObjectField({
  indexableStatus = true,
  title = true,
  description = true,
  ogImage = true,
}: SEOObjectProps): FieldDefinition {
  const indexableField = indexableStatus
    ? applyFieldCustomization(indexableBooleanField, indexableStatus)
    : null;
  const titleField = title
    ? applyFieldCustomization(seoTitleStringField, title)
    : null;
  const descriptionField = description
    ? applyFieldCustomization(seoDescriptionStringField, description)
    : null;
  const ogImageFieldCustomized = ogImage
    ? applyFieldCustomization(ogImageField, ogImage)
    : null;

  const allFields = [
    ...(indexableField ? [indexableField] : []),
    ...(titleField ? [titleField] : []),
    ...(descriptionField ? [descriptionField] : []),
    ...(ogImageFieldCustomized ? [ogImageFieldCustomized] : []),
  ];

  if (allFields.length === 0) {
    throw new Error(`[seo] must define at least one field.`);
  }

  return defineField({
    name: "seo",
    title: "SEO",
    type: "object",
    options: {collapsed: false, collapsible: true},
    fields: allFields,
  });
}
