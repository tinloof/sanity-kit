/* eslint-disable @typescript-eslint/no-explicit-any */
import type {ConfigContext, DocumentDefinition, Template} from "sanity";

/**
 * A template resolver that automatically collects and applies template configurations
 *
 * This function reads the `templates` option from your document schemas and combines
 * them with the existing templates in Sanity Studio's template registry, allowing
 * individual document types to contribute their own initial value templates.
 *
 * **Usage:**
 * ```ts
 * // In your sanity.config.ts
 * import {defineTemplates} from "@tinloof/sanity-studio";
 *
 * export default defineConfig({
 *   schema: {
 *     templates: defineTemplates, // Enable automatic template collection
 *   },
 * });
 * ```
 *
 * **Schema Configuration:**
 * Templates are configured in your document schemas using the `templates` option:
 *
 * ```ts
 * defineDocument({
 *   name: "post",
 *   title: "Post",
 *   fields: [
 *     // ... your fields
 *   ],
 *   options: {
 *     schema: {
 *       // Function approach - dynamic template generation
 *       templates: (prev, context) => [
 *         {
 *           id: 'post-blog',
 *           title: 'Blog Post',
 *           description: 'Create a new blog post',
 *           schemaType: 'post',
 *           value: {
 *             category: 'blog',
 *             publishedAt: new Date().toISOString()
 *           }
 *         }
 *       ],
 *
 *       // OR array approach - static templates
 *       templates: [
 *         {
 *           id: 'post-news',
 *           title: 'News Article',
 *           schemaType: 'post',
 *           value: { category: 'news' }
 *         }
 *       ]
 *     },
 *   },
 * });
 * ```
 *
 * **Supported Configuration Types:**
 * - **Function**: `(prev, context) => Template[]` - Dynamic template generation with access to context
 * - **Array**: `Template[]` - Static array of templates to be added to the registry
 *
 * @param prev - The existing template items from Sanity and other plugins
 * @param context - The configuration context containing schema information
 * @returns The combined array of templates including those from document schemas
 *
 * @example
 * ```ts
 * // Dynamic templates based on context or conditions
 * defineDocument({
 *   name: "article",
 *   title: "Article",
 *   fields: [...],
 *   options: {
 *     schema: {
 *       templates: (prev, context) => {
 *         const baseTemplates = [
 *           {
 *             id: 'article-standard',
 *             title: 'Standard Article',
 *             schemaType: 'article',
 *             value: {
 *               template: 'standard',
 *               createdAt: new Date().toISOString()
 *             }
 *           }
 *         ];
 *
 *         // Add conditional templates based on context
 *         if (context.currentUser?.roles?.includes('editor')) {
 *           baseTemplates.push({
 *             id: 'article-featured',
 *             title: 'Featured Article',
 *             schemaType: 'article',
 *             value: { featured: true }
 *           });
 *         }
 *
 *         return baseTemplates;
 *       },
 *     },
 *   },
 * });
 *
 * // Static templates for consistent document creation
 * defineDocument({
 *   name: "page",
 *   title: "Page",
 *   fields: [...],
 *   options: {
 *     schema: {
 *       templates: [
 *         {
 *           id: 'page-landing',
 *           title: 'Landing Page',
 *           description: 'Create a new landing page with common sections',
 *           schemaType: 'page',
 *           value: {
 *             template: 'landing',
 *             sections: [
 *               { _type: 'hero', title: 'Welcome' },
 *               { _type: 'content', body: 'Page content here...' }
 *             ]
 *           }
 *         },
 *         {
 *           id: 'page-about',
 *           title: 'About Page',
 *           schemaType: 'page',
 *           value: { template: 'about' }
 *         }
 *       ]
 *     },
 *   },
 * });
 * ```
 *
 * @internal
 * @see {@link https://www.sanity.io/docs/initial-value-templates Initial Value Templates Documentation}
 */
export default function defineTemplates(
  prev: Template<any, any>[],
  context: ConfigContext,
): Template<any, any>[] {
  /** Extract the schema from the context */
  const schema = context.schema;

  /** Get all schema types, defaulting to empty array if not available */
  const allTypes = (schema?._original?.types || []) ?? [];

  /** Filter to only document type definitions */
  const allDocumentTypes = allTypes.filter(
    (type) => type.type === "document",
  ) as DocumentDefinition[];

  /**
   * Find all document types that have templates configured and extract their templates.
   * Templates can be either arrays or functions that return arrays.
   */
  const templatesFromSchemas = allDocumentTypes
    .filter((type) => type.options?.schema?.templates)
    .flatMap((def) => {
      const templates = def.options!.schema!.templates!;

      // If it's a function, call it with previous templates and context
      if (typeof templates === "function") {
        return templates([], context);
      }

      // If it's an array, return it directly
      if (Array.isArray(templates)) {
        return templates;
      }

      return [];
    });

  /** If no documents have templates configured, return original templates */
  if (!templatesFromSchemas.length) {
    return prev;
  }

  /** Combine previous templates with templates from document schemas */
  return [...prev, ...templatesFromSchemas];
}
