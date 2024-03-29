import {
  Language as Locale,
  documentInternationalization,
} from "@sanity/document-internationalization";
import {
  BaseSchemaDefinition,
  DocumentDefinition,
  TemplateItem,
  definePlugin,
} from "sanity";

const METADATA_SCHEMA_NAME = `translation.metadata`;

/**
 * The `documentI18n` plugin can be used for projects needing translations.
 * It uses the Sanity's [Document Internationalization](https://www.sanity.io/plugins/document-internationalization) plugin under the hood.
 * The plugin will allow you to create unique translations of a document.
 * 
 * @example
 * 
 * ```tsx
 * import { documentI18n } from "@tinloof/sanity-studio";
 * import schemas from "@/sanity/schemas";
 * 
 * const i18nConfig = {
 *   locales: [
 *     { id: "en", title: "English" },
 *     { id: "fr", title: "French" },
 *   ],
 *   defaultLocaleId: "en",
 * };
 * 
 * export default defineConfig({
 *    plugins: [
 *      documentI18n({
 *        ...i18nConfig,
 *        schemas,
 *      }),
 *    ],
 * });
```
 */
export const documentI18n = definePlugin<SanityI18NPluginOptions>((options) => {
  return {
    name: "tinloof-sanity-i18n",
    title: "Sanity i18n",
    document: {
      newDocumentOptions: (prev: TemplateItem[], { schema }) => {
        // Filter out:
        //  - The translations meta document
        //  - Default templates that have a locale field but no locale parameter, so only sanity-document-internationalization templates are shown
        return prev.filter((templateItem) => {
          const schemaDefinition = schema.get(
            templateItem.templateId
          ) as unknown as DocumentDefinition;
          const schemaHasLocaleField = schemaDefinition?.fields?.some(
            (field) => field.name === "locale"
          );
          const isMetadataSchema =
            schemaDefinition?.name === METADATA_SCHEMA_NAME;
          return !isMetadataSchema && !schemaHasLocaleField;
        });
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

export type SanityI18NPluginOptions = {
  schemas: BaseSchemaDefinition[];
  locales: Locale[];
};

// Extracts the schema types that have a locale field
function extractTranslatableSchemaTypes(schemas: BaseSchemaDefinition[]) {
  return schemas
    .filter((schema: any) =>
      schema?.fields?.find((field) => field.name === "locale")
    )
    .map((schema) => schema.name);
}
