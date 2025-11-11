import {definePlugin} from "sanity";
import {DocumentPluginOptions, SchemaPluginOptions} from "sanity";

import defineActions from "./define-actions";
import defineBadges from "./define-badges";
import defineNewDocumentOptions from "./define-new-doucment-options";
import defineTemplates from "./define-templates";

declare module "sanity" {
  interface DocumentOptions {
    document?: {
      newDocumentOptions?: DocumentPluginOptions["newDocumentOptions"];
      actions?: DocumentPluginOptions["actions"];
      badges?: DocumentPluginOptions["badges"];
    };
    schema?: {
      templates?: SchemaPluginOptions["templates"];
    };
  }
}

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
 * @example Basic plugin usage
 * ```ts
 * // In your sanity.config.ts
 * import {documentOptionsPlugin} from "@tinloof/sanity-document-options";
 *
 * export default defineConfig({
 *   plugins: [
 *     documentOptionsPlugin, // Enable schema-based document configuration
 *     // ... other plugins
 *   ],
 * });
 * ```
 *
 * @example Schema configuration with document options
 * ```ts
 * defineType({
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
 * @example Complete configuration with all features
 * ```ts
 * // Complete example with all features
 * defineType({
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
 * @see {@link https://www.sanity.io/docs/document-actions | Sanity Document Actions Documentation}
 * @see {@link https://www.sanity.io/docs/initial-value-templates | Sanity Initial Value Templates Documentation}
 * @public
 */
export const documentOptionsPlugin = definePlugin({
  name: "tinloof-document-options",
  document: {
    actions: defineActions,
    newDocumentOptions: defineNewDocumentOptions,
    badges: defineBadges,
  },
  schema: {
    templates: defineTemplates,
  },
});
