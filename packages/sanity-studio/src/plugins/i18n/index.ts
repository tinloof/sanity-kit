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
    .filter((schema: DocumentDefinition) =>
      schema?.fields?.find((field) => field.name === "locale")
    )
    .map((schema: DocumentDefinition) => schema.name);
}
