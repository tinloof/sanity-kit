import type {SchemaTypeDefinition} from "sanity";

/**
 * Type for Sanity schema modules that can be functions or objects
 */
type SanitySchemaExport = SchemaTypeDefinition | (() => SchemaTypeDefinition);

/**
 * Type for modules loaded via import.meta.glob
 */
type GlobModule = () => Promise<{
  default?: SanitySchemaExport;
  [key: string]: SanitySchemaExport | unknown;
}>;

/**
 * Helper function to process imported modules and extract schemas.
 * Handles both default exports and named exports.
 *
 * @param modules - The modules object from import.meta.glob
 * @returns A promise that resolves to an array of Sanity schema type definitions
 */
async function processSchemaModules(
  modules: Record<string, GlobModule>,
): Promise<SchemaTypeDefinition[]> {
  const schemas = await Promise.all(
    Object.values(modules).map(async (mod: GlobModule) => {
      const module = await mod();
      // Handle default exports
      if (module.default) {
        const schema = module.default;
        return typeof schema === "function" ? schema() : schema;
      }
      // Handle named exports - collect all non-default exports
      const namedExports = Object.keys(module).filter(
        (key) => key !== "default" && typeof module[key] === "object",
      );
      return namedExports.map((key) => {
        const schema = module[key];
        return typeof schema === "function" ? schema() : schema;
      });
    }),
  );

  // Flatten the array since we might have multiple exports per module
  return schemas.flat().filter(Boolean) as SchemaTypeDefinition[];
}

/**
 * Imports all schemas from all schema directories using dynamic imports.
 *
 * This function uses Vite's `import.meta.glob()` to dynamically import all TypeScript and TSX files
 * from the `/src/schemas/` directory and its subdirectories. It handles both default exports
 * and named exports (like `export const home = ...`) as well as factory function exports
 * commonly used in Sanity schema definitions.
 *
 * @returns A promise that resolves to an array of Sanity schema type definitions
 *
 * @example
 * ```typescript
 * // Import all schemas for use in Sanity config
 * const allSchemas = await importAllSchemas();
 *
 * export default defineConfig({
 *   schema: {
 *     types: allSchemas,
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Both export styles are supported:
 *
 * // Default export
 * export default defineDocument({ name: 'page', ... });
 *
 * // Named export
 * export const home = defineDocument({ name: 'home', ... });
 * ```
 */
export async function importAllSchemas(): Promise<SchemaTypeDefinition[]> {
  const modules = import.meta.glob("/src/schemas/**/*.{ts,tsx}");
  return processSchemaModules(modules);
}

/**
 * Imports schemas specifically from the documents directory.
 *
 * This function dynamically imports all TypeScript and TSX files from the `/src/schemas/documents/`
 * directory. Document schemas typically represent the main content types in your Sanity
 * project (like pages, posts, products, etc.).
 *
 * @returns A promise that resolves to an array of document schema type definitions
 *
 * @example
 * ```typescript
 * // Import only document schemas
 * const documentSchemas = await importDocumentSchemas();
 *
 * // Use for organizing schemas by type
 * export default defineConfig({
 *   schema: {
 *     types: [
 *       ...documentSchemas,
 *       ...otherSchemaTypes,
 *     ],
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Filter and use document schemas
 * const docs = await importDocumentSchemas();
 * const pageSchemas = docs.filter(schema =>
 *   schema.name.includes('page')
 * );
 * ```
 */
export async function importDocumentSchemas(): Promise<SchemaTypeDefinition[]> {
  const modules = import.meta.glob("/src/schemas/documents/**/*.{ts,tsx}");
  return processSchemaModules(modules);
}

/**
 * Imports schemas from the sections directory.
 *
 * This function dynamically imports all TypeScript and TSX files from the `/src/schemas/sections/`
 * directory. Section schemas are typically used for modular page building, representing
 * reusable content blocks like heroes, testimonials, galleries, etc.
 *
 * @returns A promise that resolves to an array of section schema type definitions
 *
 * @example
 * ```typescript
 * // Import section schemas for a page builder
 * const sectionSchemas = await importSectionSchemas();
 *
 * // Use in a sections array field
 * defineField({
 *   name: 'sections',
 *   type: 'array',
 *   of: sectionSchemas.map(schema => ({
 *     type: schema.name,
 *   })),
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Get available section types
 * const sections = await importSectionSchemas();
 * const sectionTypes = sections.map(s => s.name);
 * console.log('Available sections:', sectionTypes);
 * ```
 */
export async function importSectionSchemas(): Promise<SchemaTypeDefinition[]> {
  const modules = import.meta.glob(
    "/src/schemas/objects/sections/**/*.{ts,tsx}",
  );
  return processSchemaModules(modules);
}

/**
 * Imports schemas from the objects directory.
 *
 * This function dynamically imports all TypeScript and TSX files from the `/src/schemas/objects/`
 * directory. Object schemas represent reusable field groups and complex data structures
 * that can be embedded in documents (like SEO objects, address objects, etc.).
 *
 * @returns A promise that resolves to an array of object schema type definitions
 *
 * @example
 * ```typescript
 * // Import object schemas
 * const objectSchemas = await importObjectSchemas();
 *
 * // Use in schema configuration
 * export default defineConfig({
 *   schema: {
 *     types: [
 *       ...documentSchemas,
 *       ...objectSchemas, // Add object types
 *     ],
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Find specific object schema
 * const objects = await importObjectSchemas();
 * const seoObject = objects.find(obj => obj.name === 'seo');
 * ```
 */
export async function importObjectSchemas(): Promise<SchemaTypeDefinition[]> {
  const modules = import.meta.glob("/src/schemas/objects/**/*.{ts,tsx}");
  return processSchemaModules(modules);
}

/**
 * Imports schemas from the singletons directory.
 *
 * This function dynamically imports all TypeScript and TSX files from the `/src/schemas/singletons/`
 * directory. Singleton schemas represent unique documents that should only have one instance
 * (like site settings, global configuration, etc.).
 *
 * @returns A promise that resolves to an array of singleton schema type definitions
 *
 * @example
 * ```typescript
 * // Import singleton schemas
 * const singletonSchemas = await importSingletonSchemas();
 *
 * // Use with disable creation plugin
 * export default defineConfig({
 *   schema: {
 *     types: singletonSchemas,
 *   },
 *   plugins: [
 *     disableCreation({
 *       types: singletonSchemas.map(s => s.name),
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Get settings schema
 * const singletons = await importSingletonSchemas();
 * const settingsSchema = singletons.find(s => s.name === 'settings');
 * ```
 */
export async function importSingletonSchemas(): Promise<
  SchemaTypeDefinition[]
> {
  const modules = import.meta.glob("/src/schemas/singletons/**/*.{ts,tsx}");
  return processSchemaModules(modules);
}
