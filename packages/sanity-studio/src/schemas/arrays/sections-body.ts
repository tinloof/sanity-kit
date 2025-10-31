import {defineField, SchemaTypeDefinition} from "sanity";

/**
 * Props for the sections body array schema function.
 */
export type SectionBodyArraySchemaProps = {
  /** Function to generate preview image URLs for sections in the insert menu */
  previewImage?: (type: string) => string;
  /** Array of section schemas. This parameter is now required. */
  sections:
    | Array<{name: string} & Record<string, unknown>>
    | SchemaTypeDefinition[];
};

/**
 * Creates a sections body array field schema for Sanity Studio.
 *
 * This function generates a field definition for an array of sections that can be used
 * in document schemas. It operates synchronously and requires a `sections` array to be provided.
 *
 * @param props - Configuration options for the sections body array
 * @param props.sections - Array of section schemas that will be available in the array
 * @param props.previewImage - Function to generate preview image URLs for sections in the insert menu
 *
 * @returns A field definition object for the sections body array
 *
 * @example
 * ```typescript
 * // Usage with provided sections
 * const field = sectionsBodyArraySchema({
 *   sections: [
 *     { name: "hero", title: "Hero Section" },
 *     { name: "banner", title: "Banner Section" }
 *   ],
 *   previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Using in a document schema
 * export default defineType({
 *   name: "page",
 *   type: "document",
 *   fields: [
 *     sectionsBodyArraySchema({
 *       sections: mySections,
 *       previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 *     })
 *   ]
 * });
 * ```
 */
function sectionsBodyArraySchema(
  props: SectionBodyArraySchemaProps,
): ReturnType<typeof defineField> {
  const {sections, previewImage} = props;

  const getPreviewImageUrl = (type: string): string => {
    if (previewImage) {
      return previewImage(type);
    }

    return `/static/sections/${type.replace("section.", "")}.png`;
  };

  const sectionFields = sections.map(({name}) => ({
    type: name,
  }));

  return defineField({
    name: "sectionsBody",
    title: "Sections",
    type: "array",
    of: sectionFields,
    options: {
      insertMenu: {
        views: [
          {
            name: "grid",
            previewImageUrl: getPreviewImageUrl,
          },
        ],
      },
    },
  });
}

export default sectionsBodyArraySchema;
