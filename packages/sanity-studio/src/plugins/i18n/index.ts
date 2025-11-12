import {
  documentInternationalization,
  Language as Locale,
} from "@sanity/document-internationalization";
import {
  definePlugin,
  DocumentDefinition,
  SchemaTypeDefinition,
  TemplateItem,
} from "sanity";

const METADATA_SCHEMA_NAME = `translation.metadata`;

/**
 * A Sanity Studio plugin for document internationalization and translation management.
 *
 * This plugin extends Sanity's Document Internationalization plugin to provide a streamlined
 * experience for managing translations. It automatically filters out translation metadata
 * from document templates and configures document-level internationalization for schemas
 * that contain locale fields or are marked as localized.
 *
 * @param options - Configuration options for the i18n plugin
 * @param options.schemas - Array of schema type definitions to analyze for localization
 * @param options.locales - Array of supported locales with id and title properties
 *
 * @returns A configured Sanity plugin for document internationalization
 *
 * @example
 * Basic usage with locale configuration:
 * ```tsx
 * import { documentI18n } from "@tinloof/sanity-studio";
 * import schemas from "@/sanity/schemas";
 *
 * const i18nConfig = {
 *   locales: [
 *     { id: "en", title: "English" },
 *     { id: "fr", title: "French" },
 *     { id: "es", title: "Spanish" },
 *   ],
 *   defaultLocaleId: "en",
 * };
 *
 * export default defineConfig({
 *   plugins: [
 *     documentI18n({
 *       ...i18nConfig,
 *       schemas,
 *     }),
 *   ],
 * });
 * ```
 *
 * @example
 * Document schema with locale field:
 * ```tsx
 * export const blogPost = {
 *   name: 'blogPost',
 *   type: 'document',
 *   fields: [
 *     {
 *       name: 'locale',
 *       type: 'string',
 *       // This field makes the document translatable
 *     },
 *     {
 *       name: 'title',
 *       type: 'string',
 *     },
 *     // ... other fields
 *   ]
 * }
 * ```
 *
 * @example
 * Document schema with localized option:
 * ```tsx
 * export const page = {
 *   name: 'page',
 *   type: 'document',
 *   options: {
 *     localized: true, // Alternative way to mark as translatable
 *   },
 *   fields: [
 *     // ... fields
 *   ]
 * }
 * ```
 *
 * @see {@link https://www.sanity.io/plugins/document-internationalization} Sanity Document Internationalization plugin
 */
export const documentI18n = definePlugin<SanityI18NPluginOptions>((options) => {
  return {
    name: "tinloof-sanity-i18n",
    title: "Sanity i18n",
    schema: {
      /**
       * Removes default localeless schema templates for translatable document types.
       *
       * When a schema has translations (contains a locale field or is marked as localized),
       * this filter removes only the default template without a locale suffix, while keeping
       * all locale-specific templates created by the document internationalization plugin.
       * This prevents the creation of untranslated documents while preserving the ability
       * to create documents in specific locales.
       *
       * @param prev - Array of existing template definitions
       * @param context - Schema context containing the original schema definitions
       * @param context.schema._original.types - Original schema type definitions
       * @returns Filtered array excluding default localeless templates for translatable schemas
       *
       * @example
       * If you have schemas like:
       * ```tsx
       * const home = { name: 'home', fields: [{ name: 'locale' }] } // translatable
       * const author = { name: 'author', fields: [{ name: 'name' }] } // not translatable
       * ```
       * Available templates become:
       * - ❌ 'home' (default localeless template - removed)
       * - ✅ 'home-en' (English locale template - kept)
       * - ✅ 'home-fr' (French locale template - kept)
       * - ✅ 'author' (not translatable - kept)
       */
      templates: (prev, context) => {
        const {
          schema: {_original},
        } = context;
        const {types} = _original ?? {};

        const schemasWithTranslations = extractTranslatableSchemaTypes(
          types ?? [],
        );

        return prev.filter(({id}) => !schemasWithTranslations.includes(id));
      },
    },
    document: {
      /**
       * Filters translation metadata documents from user-facing document creation menus.
       *
       * The translation metadata document (translation.metadata) is used internally by
       * the document internationalization plugin to track translation relationships.
       * This filter keeps the metadata template available for internal plugin use
       * but removes it from user-facing creation dialogs to prevent accidental creation.
       *
       * @param prev - Array of existing template items for document creation
       * @returns Filtered array excluding translation metadata templates from user menus
       *
       * @example
       * Without this filter, users would see in creation menus:
       * - Blog Post (English)
       * - Blog Post (French)
       * - Author
       * - translation.metadata ← This gets filtered out from user menus
       *
       * With this filter, users only see:
       * - Blog Post (English)
       * - Blog Post (French)
       * - Author
       */
      newDocumentOptions: (prev: TemplateItem[]) => {
        return prev.filter(
          ({templateId}) => templateId !== METADATA_SCHEMA_NAME,
        );
      },
    },
    plugins: [
      documentInternationalization({
        languageField: "locale",
        supportedLanguages: options.locales,
        schemaTypes: extractTranslatableSchemaTypes(options.schemas),
      }),
    ],
  };
});

/**
 * Configuration options for the documentI18n plugin.
 */
export type SanityI18NPluginOptions = {
  /** Array of schema type definitions to analyze for localization capabilities */
  schemas: SchemaTypeDefinition[];
  /** Array of supported locales with id and title properties */
  locales: Locale[];
};

/**
 * Extracts document schema types that are configured for translation.
 *
 * A schema is considered translatable if it:
 * - Is a document type
 * - Has a field named "locale"
 * - OR has the `options.localized` flag set to true
 *
 * @param schemas - Array of schema type definitions to analyze
 * @returns Array of schema names that support translations
 */
function extractTranslatableSchemaTypes(schemas: SchemaTypeDefinition[]) {
  return schemas
    .filter((schema) => schema.type === "document")
    .filter(
      (schema) =>
        (schema as DocumentDefinition).fields.some(
          (field) => field.name === "locale",
        ) || (schema as DocumentDefinition).options?.localized,
    )
    .map((schema) => schema.name);
}

/**
 * Extends Sanity's DocumentOptions interface to include the localized flag.
 * This allows marking document schemas as translatable using the options property.
 */
declare module "sanity" {
  interface DocumentOptions {
    /** Whether this document type supports localization/translation */
    localized?: boolean;
  }
}
