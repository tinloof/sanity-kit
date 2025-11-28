import {SchemaTypeDefinition} from "sanity";
import {ExtendedType} from "./types";
import {resolveExtends} from "./resolve-extends";

/**
 * Creates a schema extension function that can be used with Sanity's schema configuration.
 *
 * This function takes an array of extended types (including abstract types and resolvers)
 * and returns a function that can be used in Sanity's schema configuration to merge
 * the provided types with the existing schema types.
 *
 * @param types - Array of extended types to add to the schema
 * @returns A function that takes previous schema types and returns resolved types
 *
 * @example
 * ```ts
 * // In your sanity.config.ts
 * import { defineConfig } from 'sanity';
 * import { withExtends } from '@tinloof/sanity-extends';
 *
 * export default defineConfig({
 *   // ... other config
 *   schema: {
 *     types: withExtends([
 *       // Abstract types
 *       {
 *         type: 'abstract',
 *         name: 'seoFields',
 *         fields: [
 *           { name: 'metaTitle', type: 'string' },
 *           { name: 'metaDescription', type: 'text' },
 *         ],
 *       },
 *       // Documents that extend abstracts
 *       {
 *         type: 'document',
 *         name: 'page',
 *         extends: 'seoFields',
 *         fields: [
 *           { name: 'title', type: 'string' },
 *         ],
 *       },
 *     ]),
 *   },
 * });
 * ```
 */
export function withExtends(types: ExtendedType[]) {
  return (prev: SchemaTypeDefinition[]) => resolveExtends([...prev, ...types]);
}
