import {defineField, SchemaTypeDefinition} from "sanity";

import {importSectionSchemas} from "../../utils";

/**
 * Props for the sections body array schema function.
 */
export type SectionBodyArraySchemaProps = {
  /** Function to generate preview image URLs for sections in the insert menu */
  previewImage?: (type: string) => string;
  /** Array of section schemas. When provided, the function returns synchronously.
   * When omitted, sections are imported dynamically and the function returns a Promise. */
  sections?:
    | Array<{name: string} & Record<string, unknown>>
    | SchemaTypeDefinition[];
};

/**
 * Creates a sections body array field schema for Sanity Studio.
 *
 * This function generates a field definition for an array of sections that can be used
 * in document schemas. It supports both synchronous and asynchronous operation modes
 * depending on whether sections are provided directly or need to be imported dynamically.
 *
 * **⚠️ Compatibility Notice:** The async version (without `sections` parameter) only works
 * in standalone Sanity Studio projects. It is **not compatible** with embedded setups (e.g.,
 * Sanity Studio embedded in Next.js apps) as it depends on Vite's build system and
 * `import.meta.glob()` functionality. For embedded setups, provide the `sections` array directly.
 *
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.previewImage - Function to generate preview image URLs for sections in the insert menu
 *
 * @returns A field definition object when sections are provided, or a Promise that resolves
 *          to a field definition when sections need to be imported dynamically.
 *
 * @example
 * ```typescript
 * // No parameters - uses defaults
 * const field = await sectionsBodyArraySchema();
 *
 * // Synchronous usage with provided sections
 * const field = sectionsBodyArraySchema({
 *   sections: [
 *     { name: "hero", title: "Hero Section" },
 *     { name: "banner", title: "Banner Section" }
 *   ],
 *   previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   previewImage: (type) => `/custom/path/${type}.jpg`
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
 *     await sectionsBodyArraySchema(),
 *     // or with options
 *     await sectionsBodyArraySchema({
 *       previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 *     })
 *   ]
 * });
 * ```
 */
// No parameters - function is async
function sectionsBodyArraySchema(): Promise<ReturnType<typeof defineField>>;

/**
 * Creates a sections body array field schema for Sanity Studio.
 *
 * This function generates a field definition for an array of sections that can be used
 * in document schemas. It supports both synchronous and asynchronous operation modes
 * depending on whether sections are provided directly or need to be imported dynamically.
 *
 * **⚠️ Compatibility Notice:** The async version (without `sections` parameter) only works
 * in standalone Sanity Studio projects. It is **not compatible** with embedded setups (e.g.,
 * Sanity Studio embedded in Next.js apps) as it depends on Vite's build system and
 * `import.meta.glob()` functionality. For embedded setups, provide the `sections` array directly.
 *
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.previewImage - Function to generate preview image URLs for sections in the insert menu
 *
 * @returns A field definition object when sections are provided, or a Promise that resolves
 *          to a field definition when sections need to be imported dynamically.
 *
 * @example
 * ```typescript
 * // No parameters - uses defaults
 * const field = await sectionsBodyArraySchema();
 *
 * // Synchronous usage with provided sections
 * const field = sectionsBodyArraySchema({
 *   sections: [
 *     { name: "hero", title: "Hero Section" },
 *     { name: "banner", title: "Banner Section" }
 *   ],
 *   previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   previewImage: (type) => `/custom/path/${type}.jpg`
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
 *     await sectionsBodyArraySchema(),
 *     // or with options
 *     await sectionsBodyArraySchema({
 *       previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 *     })
 *   ]
 * });
 * ```
 */
// When sections are provided, function is not async
function sectionsBodyArraySchema(
  props: SectionBodyArraySchemaProps & {
    sections:
      | Array<{name: string} & Record<string, unknown>>
      | SchemaTypeDefinition[];
  },
): ReturnType<typeof defineField>;

/**
 * Creates a sections body array field schema for Sanity Studio.
 *
 * This function generates a field definition for an array of sections that can be used
 * in document schemas. It supports both synchronous and asynchronous operation modes
 * depending on whether sections are provided directly or need to be imported dynamically.
 *
 * **⚠️ Compatibility Notice:** The async version (without `sections` parameter) only works
 * in standalone Sanity Studio projects. It is **not compatible** with embedded setups (e.g.,
 * Sanity Studio embedded in Next.js apps) as it depends on Vite's build system and
 * `import.meta.glob()` functionality. For embedded setups, provide the `sections` array directly.
 *
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.previewImage - Function to generate preview image URLs for sections in the insert menu
 *
 * @returns A field definition object when sections are provided, or a Promise that resolves
 *          to a field definition when sections need to be imported dynamically.
 *
 * @example
 * ```typescript
 * // No parameters - uses defaults
 * const field = await sectionsBodyArraySchema();
 *
 * // Synchronous usage with provided sections
 * const field = sectionsBodyArraySchema({
 *   sections: [
 *     { name: "hero", title: "Hero Section" },
 *     { name: "banner", title: "Banner Section" }
 *   ],
 *   previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   previewImage: (type) => `/custom/path/${type}.jpg`
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
 *     await sectionsBodyArraySchema(),
 *     // or with options
 *     await sectionsBodyArraySchema({
 *       previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 *     })
 *   ]
 * });
 * ```
 */
// When sections are NOT provided, function is async
function sectionsBodyArraySchema(
  props: SectionBodyArraySchemaProps & {sections?: undefined},
): Promise<ReturnType<typeof defineField>>;

/**
 * Creates a sections body array field schema for Sanity Studio.
 *
 * This function generates a field definition for an array of sections that can be used
 * in document schemas. It supports both synchronous and asynchronous operation modes
 * depending on whether sections are provided directly or need to be imported dynamically.
 *
 * **⚠️ Compatibility Notice:** The async version (without `sections` parameter) only works
 * in standalone Sanity Studio projects. It is **not compatible** with embedded setups (e.g.,
 * Sanity Studio embedded in Next.js apps) as it depends on Vite's build system and
 * `import.meta.glob()` functionality. For embedded setups, provide the `sections` array directly.
 *
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.previewImage - Function to generate preview image URLs for sections in the insert menu
 *
 * @returns A field definition object when sections are provided, or a Promise that resolves
 *          to a field definition when sections need to be imported dynamically.
 *
 * @example
 * ```typescript
 * // No parameters - uses defaults
 * const field = await sectionsBodyArraySchema();
 *
 * // Synchronous usage with provided sections
 * const field = sectionsBodyArraySchema({
 *   sections: [
 *     { name: "hero", title: "Hero Section" },
 *     { name: "banner", title: "Banner Section" }
 *   ],
 *   previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   previewImage: (type) => `/custom/path/${type}.jpg`
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
 *     await sectionsBodyArraySchema(),
 *     // or with options
 *     await sectionsBodyArraySchema({
 *       previewImage: (type) => `/static/sections/${type.replace("section.", "")}.png`
 *     })
 *   ]
 * });
 * ```
 */
function sectionsBodyArraySchema(
  props?: SectionBodyArraySchemaProps,
): ReturnType<typeof defineField> | Promise<ReturnType<typeof defineField>> {
  const {sections, previewImage} = props || {};

  const getPreviewImageUrl = (type: string): string => {
    if (previewImage) {
      return previewImage(type);
    }

    return `/static/sections/${type.replace("section.", "")}.png`;
  };

  const createFieldDefinition = (sectionFields: Array<{type: string}>) => {
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
  };

  // If sections are provided, return synchronously
  if (sections) {
    const sectionFields = sections.map(({name}) => ({
      type: name,
    }));
    return createFieldDefinition(sectionFields);
  }

  // Otherwise, return async (using IIFE to handle async)
  return (async () => {
    const sectionFields = (await importSectionSchemas()).map(({name}) => ({
      type: name,
    }));
    return createFieldDefinition(sectionFields);
  })();
}

export default sectionsBodyArraySchema;
