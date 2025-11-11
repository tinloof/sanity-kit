import {definePlugin} from "sanity";

import defineActions from "./define-actions";
import defineNewDocumentOptions from "./define-new-doucment-options";
import defineTemplates from "./define-templates";

/**
 * A Sanity plugin that enables document schemas to configure their own
 * document actions, new document options, and templates directly within the schema definition.
 *
 * This plugin automatically reads configuration from document schemas and applies them to the appropriate
 * Sanity Studio interfaces.
 *
 * **Features:**
 * - **Document Actions**: Configure custom actions or filter existing ones per document type
 * - **New Document Options**: Control which templates appear in the "Create new document" interface
 * - **Templates**: Define initial value templates directly in document schemas
 *
 * **Usage:**
 * ```ts
 * // In your sanity.config.ts
 * import {documentOptionsPlugin} from "@tinloof/sanity-studio";
 *
 * export default defineConfig({
 *   plugins: [
 *     documentOptionsPlugin, // Enable schema-based document configuration
 *     // ... other plugins
 *   ],
 * });
 * ```
 *
 * **Schema Configuration:**
 * Configure document options directly in your schemas:
 *
 * ```ts
 * defineDocument({
 *   name: "post",
 *   title: "Post",
 *   fields: [...],
 *   options: {
 *     // Document actions configuration
 *     document: {
 *       actions: (prev, context) => {
 *         // Remove delete action for published posts
 *         if (context.published) {
 *           return prev.filter(action => action.action !== 'delete');
 *         }
 *         return prev;
 *       },
 *
 *       // New document options configuration
 *       newDocumentOptions: (prev, context) => {
 *         return prev.filter(template => template.schemaType !== 'draft');
 *       },
 *     },
 *
 *     // Templates configuration
 *     schema: {
 *       templates: [
 *         {
 *           id: 'post-blog',
 *           title: 'Blog Post',
 *           schemaType: 'post',
 *           value: { category: 'blog' }
 *         }
 *       ]
 *     },
 *   },
 * });
 * ```
 *
 * **Plugin Components:**
 * - `defineActions` - Handles document actions configuration
 * - `defineNewDocumentOptions` - Manages new document template filtering
 * - `defineTemplates` - Collects and applies schema-defined templates
 *
 * @example
 * ```ts
 * // Complete example with all features
 * defineDocument({
 *   name: "article",
 *   title: "Article",
 *   fields: [...],
 *   options: {
 *     document: {
 *       // Custom actions
 *       actions: (prev, context) => [
 *         ...prev,
 *         {
 *           label: 'Generate SEO',
 *           onHandle: () => { /* SEO generation logic *\/ }
 *         }
 *       ],
 *
 *       // Filter new document options
 *       newDocumentOptions: (prev, context) => {
 *         return prev.map(template => ({
 *           ...template,
 *           title: `New ${template.title}`
 *         }));
 *       },
 *     },
 *     schema: {
 *       // Add templates
 *       templates: (prev, context) => [
 *         {
 *           id: 'article-interview',
 *           title: 'Interview Article',
 *           schemaType: 'article',
 *           value: {
 *             format: 'interview',
 *             sections: [
 *               { _type: 'interviewQuestion', question: 'Tell us about yourself' }
 *             ]
 *           }
 *         }
 *       ]
 *     }
 *   }
 * });
 * ```
 *
 * @see {@link https://www.sanity.io/docs/document-actions Document Actions}
 * @see {@link https://www.sanity.io/docs/initial-value-templates Templates}
 */
export default definePlugin({
  name: "tinloof-document-options",
  document: {
    actions: defineActions,
    newDocumentOptions: defineNewDocumentOptions,
  },
  schema: {
    templates: defineTemplates,
  },
});
