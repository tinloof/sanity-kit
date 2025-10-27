import {defineField, SchemaTypeDefinition} from "sanity";

import {importSectionSchemas} from "../../utils";

/**
 * Configuration object for preview images in section insert menus.
 */
export type PreviewImageConfig = {
  /** Base path where preview images are located. Defaults to "/static/sections/" */
  basePath?: string;
  /** File extension for preview images. Defaults to ".png" */
  extension?: string;
  /** Prefix to strip from section type names when generating image paths. Defaults to "section." */
  stripPrefix?: string;
};

/**
 * Options for configuring preview images in section insert menus.
 * Can be a configuration object or a function that returns a URL.
 */
export type PreviewImageOptions =
  | PreviewImageConfig
  | ((type: string) => string);

/**
 * Configuration options for the sections body array schema.
 */
export type SectionsBodyOptions = {
  /** Configuration for preview images shown in the section insert menu */
  previewImage?: PreviewImageOptions;
};

/**
 * Props for the sections body array schema function.
 */
export type SectionBodyArraySchemaProps = {
  /** Configuration options for the sections body array */
  options?: SectionsBodyOptions;
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
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.options - Optional configuration for preview images and other settings
 * @param props.options.previewImage - Configuration for section preview images in the
 *                                   insert menu. Can be a function, config object, or undefined
 *                                   for default behavior.
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
 *   options: {
 *     previewImage: {
 *       basePath: "/static/sections/",
 *       extension: ".png"
 *     }
 *   }
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   options: {
 *     previewImage: (type) => `/custom/path/${type}.jpg`
 *   }
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
 *       options: {
 *         previewImage: {
 *           basePath: "/static/sections/",
 *           stripPrefix: "section."
 *         }
 *       }
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
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.options - Optional configuration for preview images and other settings
 * @param props.options.previewImage - Configuration for section preview images in the
 *                                   insert menu. Can be a function, config object, or undefined
 *                                   for default behavior.
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
 *   options: {
 *     previewImage: {
 *       basePath: "/static/sections/",
 *       extension: ".png"
 *     }
 *   }
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   options: {
 *     previewImage: (type) => `/custom/path/${type}.jpg`
 *   }
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
 *       options: {
 *         previewImage: {
 *           basePath: "/static/sections/",
 *           stripPrefix: "section."
 *         }
 *       }
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
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.options - Optional configuration for preview images and other settings
 * @param props.options.previewImage - Configuration for section preview images in the
 *                                   insert menu. Can be a function, config object, or undefined
 *                                   for default behavior.
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
 *   options: {
 *     previewImage: {
 *       basePath: "/static/sections/",
 *       extension: ".png"
 *     }
 *   }
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   options: {
 *     previewImage: (type) => `/custom/path/${type}.jpg`
 *   }
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
 *       options: {
 *         previewImage: {
 *           basePath: "/static/sections/",
 *           stripPrefix: "section."
 *         }
 *       }
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
 * @param props - Optional configuration options for the sections body array
 * @param props.sections - Optional array of section schemas. When provided, the function
 *                        returns synchronously. When omitted, it returns a Promise that
 *                        imports sections dynamically.
 * @param props.options - Optional configuration for preview images and other settings
 * @param props.options.previewImage - Configuration for section preview images in the
 *                                   insert menu. Can be a function, config object, or undefined
 *                                   for default behavior.
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
 *   options: {
 *     previewImage: {
 *       basePath: "/static/sections/",
 *       extension: ".png"
 *     }
 *   }
 * });
 *
 * // Asynchronous usage with dynamic section import
 * const field = await sectionsBodyArraySchema({
 *   options: {
 *     previewImage: (type) => `/custom/path/${type}.jpg`
 *   }
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
 *       options: {
 *         previewImage: {
 *           basePath: "/static/sections/",
 *           stripPrefix: "section."
 *         }
 *       }
 *     })
 *   ]
 * });
 * ```
 */
function sectionsBodyArraySchema(
  props?: SectionBodyArraySchemaProps,
): ReturnType<typeof defineField> | Promise<ReturnType<typeof defineField>> {
  const {sections, options = {}} = props || {};

  const getPreviewImageUrl = (type: string): string => {
    if (typeof options.previewImage === "function") {
      return options.previewImage(type);
    }
    //
    if (typeof options.previewImage === "object") {
      const config = options.previewImage;
      const basePath = config.basePath ?? "/static/sections/";
      const extension = config.extension ?? ".png";
      const stripPrefix = config.stripPrefix ?? "section.";

      const sectionName = type.replace(stripPrefix, "");
      return `${basePath}${sectionName}${extension}`;
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
