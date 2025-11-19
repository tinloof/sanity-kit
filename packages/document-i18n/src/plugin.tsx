import {Stack} from "@sanity/ui";
import {
  definePlugin,
  isSanityDocument,
  BaseSchemaDefinition,
  SchemaTypeDefinition,
} from "sanity";

import {DeleteMetadataAction} from "./actions/delete-metadata-action";
import {LanguageBadge} from "./badges";
import BulkPublish from "./components/bulk-publish";
import {DocumentInternationalizationProvider} from "./components/document-internationalization-context";
import {DocumentInternationalizationMenu} from "./components/document-internationalization-menu";
import OptimisticallyStrengthen from "./components/optimistically-strengthen";
import {DEFAULT_CONFIG, METADATA_SCHEMA_NAME} from "./constants";
import {documentInternationalizationUsEnglishLocaleBundle} from "./i18n";
import type {PluginConfig, TranslationReference} from "./types";
import {DocumentDefinition} from "sanity";

function extractSchemaTypeNames(
  schemas: SchemaTypeDefinition[],
  languageField: string,
) {
  return schemas
    .filter(
      (schema): schema is DocumentDefinition => schema.type === "document",
    )
    .filter(
      (schema) => schema.fields.find((field) => field.name === languageField), // todo: check also for the locale field type
    )
    .map((schema) => schema.name);
}

export const documentInternationalization = definePlugin<PluginConfig>(
  (config) => {
    const pluginConfig = {...DEFAULT_CONFIG, ...config};
    const {locales, languageField} = pluginConfig;

    const bulkPublish = false;

    return {
      name: "@tinloof/sanity-document-i18n",
      studio: {
        components: {
          layout: (props) => (
            <DocumentInternationalizationProvider
              {...props}
              pluginConfig={{...pluginConfig}}
            />
          ),
        },
      },
      i18n: {
        bundles: [documentInternationalizationUsEnglishLocaleBundle],
      },
      // Adds:
      // - A bulk-publishing UI component to the form
      // - Will only work for projects on a compatible plan
      form: {
        components: {
          input: (props) => {
            if (
              props.id === "root" &&
              props.schemaType.name === METADATA_SCHEMA_NAME &&
              isSanityDocument(props?.value)
            ) {
              const metadataId = props?.value?._id;
              const translations =
                (props?.value?.translations as TranslationReference[]) ?? [];
              const weakAndTypedTranslations = translations.filter(
                ({value}) => value?._weak && value._strengthenOnPublish,
              );

              return (
                <Stack space={5}>
                  {bulkPublish ? (
                    <BulkPublish translations={translations} />
                  ) : null}
                  {weakAndTypedTranslations.length > 0 ? (
                    <OptimisticallyStrengthen
                      metadataId={metadataId}
                      translations={weakAndTypedTranslations}
                    />
                  ) : null}
                  {props.renderDefault(props)}
                </Stack>
              );
            }

            return props.renderDefault(props);
          },
        },
      },
      // Adds:
      // - The `Translations` dropdown to the editing form
      // - `Badges` to documents with a language value
      // - The `DeleteMetadataAction` action to the metadata document type
      document: {
        unstable_languageFilter: (prev, ctx) => {
          const {schemaType, documentId} = ctx;

          const schemaTypes = extractSchemaTypeNames(
            (ctx.schema._original?.types || []).filter(
              (type): type is DocumentDefinition => type.type === "document",
            ),
            languageField,
          );

          return schemaTypes.includes(schemaType) && documentId
            ? [
                ...prev,
                (props) => (
                  <DocumentInternationalizationMenu
                    {...props}
                    documentId={documentId}
                  />
                ),
              ]
            : prev;
        },
        badges: (prev, {schemaType, schema}) => {
          const schemaTypes = extractSchemaTypeNames(
            (schema._original?.types || []).filter(
              (type): type is DocumentDefinition => type.type === "document",
            ),
            languageField,
          );

          if (!schemaTypes.includes(schemaType)) {
            return prev;
          }

          return [LanguageBadge, ...prev];
        },
        newDocumentOptions: (prev, {schema}) => {
          // Filter out:
          //  - The translations meta document
          //  - Default templates that have a locale field but no locale parameter, so only sanity-document-internationalization templates are shown
          return prev.filter((templateItem) => {
            const schemaDefinition = schema.get(
              templateItem.templateId,
            ) as unknown as DocumentDefinition;
            const schemaHasLocaleField = schemaDefinition?.fields?.some(
              (field) => field.name === "locale",
            );
            const isMetadataSchema =
              schemaDefinition?.name === METADATA_SCHEMA_NAME;
            return !isMetadataSchema && !schemaHasLocaleField;
          });
        },
        actions: (prev, {schemaType}) => {
          if (schemaType === METADATA_SCHEMA_NAME) {
            return [...prev, DeleteMetadataAction];
          }

          return prev;
        },
      },

      // Adds:
      // - The `Translations metadata` document type to the schema
      schema: {
        // Create the metadata document type
        // types: [metadata(["article"], metadataFields)],

        // For every schema type this plugin is enabled on
        // Create an initial value template to set the language
        templates: (prev, {schema}) => {
          // Templates are not setup for async languages
          if (!Array.isArray(locales)) {
            return prev;
          }

          const schemaTypes = extractSchemaTypeNames(
            (schema._original?.types || []).filter(
              (type): type is DocumentDefinition => type.type === "document",
            ),
            languageField,
          );

          const parameterizedTemplates = schemaTypes.map((schemaType) => ({
            id: `${schemaType}-parameterized`,
            title: `${
              schema?.get(schemaType)?.title ?? schemaType
            }: with Language`,
            schemaType,
            parameters: [
              {name: `languageId`, title: `Language ID`, type: `string`},
            ],
            value: ({languageId}: {languageId: string}) => ({
              [languageField]: languageId,
            }),
          }));

          const staticTemplates = schemaTypes.flatMap((schemaType) => {
            return locales.map((locale) => ({
              id: `${schemaType}-${locale.id}`,
              title: `${locale.title} ${
                schema?.get(schemaType)?.title ?? schemaType
              }`,
              schemaType,
              value: {
                [languageField]: locale.id,
              },
            }));
          });

          return [...prev, ...parameterizedTemplates, ...staticTemplates];
        },
      },
    };
  },
);
