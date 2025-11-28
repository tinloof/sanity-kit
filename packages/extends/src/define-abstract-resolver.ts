import {AbstractDefinitionResolver} from "./types";

/**
 * Helper function to define an abstract resolver with proper typing.
 *
 * This is a simple identity function that provides type inference
 * for abstract resolver definitions.
 *
 * @param schema - The abstract resolver function
 * @returns The same resolver function with proper typing
 *
 * @example
 * ```ts
 * const sluggableResolver = defineAbstractResolver((document, options) => ({
 *   type: "abstract",
 *   name: "sluggable",
 *   fields: [
 *     {
 *       name: "slug",
 *       type: "slug",
 *       options: {
 *         source: options?.source ?? "title",
 *       },
 *     },
 *   ],
 * }));
 * ```
 */
export function defineAbstractResolver(
  schema: AbstractDefinitionResolver,
): AbstractDefinitionResolver {
  return schema;
}
