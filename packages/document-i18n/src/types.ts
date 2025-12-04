/* eslint-disable no-unused-vars */

import {CreateAbstractsConfig} from "@tinloof/sanity-extends";
import {ABSTRACTS_MAP} from "./abstracts";
import type {
  KeyedObject,
  ObjectSchemaType,
  Reference,
  SanityClient,
  SanityDocument,
  SanityDocumentLike,
} from "sanity";

export type Locale = {
  id: Intl.UnicodeBCP47LocaleIdentifier;
  title: string;
};

export type SupportedLocales =
  | Locale[]
  | ((client: SanityClient) => Promise<Locale[]>);

export type PluginCallbackArgs = {
  sourceDocument: SanityDocument;
  newDocument: SanityDocument;
  sourceLocaleId: string;
  destinationLocaleId: string;
  metaDocumentId: string;
  client: SanityClient;
};

export type PluginConfig = {
  locales: SupportedLocales;
  // schemas: BaseSchemaDefinition[];
  localeField?: string;
  weakReferences?: boolean;
  bulkPublish?: boolean;
  // metadataFields?: FieldDefinition[];
  apiVersion?: string;
  allowCreateMetaDoc?: boolean;
  callback?: ((args: PluginCallbackArgs) => Promise<void>) | null;
  abstracts?: CreateAbstractsConfig<keyof typeof ABSTRACTS_MAP>;
};

// Context version of config
// should have processed the
// supportedLanguages function
export type PluginConfigContext = Required<PluginConfig> & {
  locales: Locale[];
};

export type TranslationReference = KeyedObject & {
  _type: "internationalizedArrayReferenceValue";
  value: Reference;
};

export type Metadata = {
  _id: string;
  _createdAt: string;
  translations: TranslationReference[];
};

export type MetadataDocument = SanityDocumentLike & {
  schemaTypes: string[];
  translations: TranslationReference[];
};

export type DocumentI18nMenuProps = {
  schemaType: ObjectSchemaType;
  documentId: string;
};

// Extend Sanity schema definitions
export interface DocumentI18nSchemaOpts {
  documentI18n?: {
    /** Set to true to disable duplication of this field or type */
    exclude?: boolean;
  };
}

declare module "sanity" {
  interface ArrayOptions extends DocumentI18nSchemaOpts {}
  interface BlockOptions extends DocumentI18nSchemaOpts {}
  interface BooleanOptions extends DocumentI18nSchemaOpts {}
  interface CrossDatasetReferenceOptions extends DocumentI18nSchemaOpts {}
  interface DateOptions extends DocumentI18nSchemaOpts {}
  interface DatetimeOptions extends DocumentI18nSchemaOpts {}
  interface FileOptions extends DocumentI18nSchemaOpts {}
  interface GeopointOptions extends DocumentI18nSchemaOpts {}
  interface ImageOptions extends DocumentI18nSchemaOpts {}
  interface NumberOptions extends DocumentI18nSchemaOpts {}
  interface ObjectOptions extends DocumentI18nSchemaOpts {}
  interface ReferenceBaseOptions extends DocumentI18nSchemaOpts {}
  interface SlugOptions extends DocumentI18nSchemaOpts {}
  interface StringOptions extends DocumentI18nSchemaOpts {}
  interface TextOptions extends DocumentI18nSchemaOpts {}
  interface UrlOptions extends DocumentI18nSchemaOpts {}
  interface EmailOptions extends DocumentI18nSchemaOpts {}
}

declare module "@tinloof/sanity-extends" {
  interface ExtendsRegistry {
    i18n: undefined;
  }
}
