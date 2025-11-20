import * as React from "react";
import {DocumentPluginOptions, SchemaPluginOptions} from "sanity";
import {ListItemBuilder} from "sanity/structure";
import {StructureResolverContext} from "sanity/structure";
import {
  type StructureBuilder,
  type View,
  type ViewBuilder,
} from "sanity/structure";

/**
 * Locale configuration for i18n
 * @public
 */
export type Locale = {
  id: Intl.UnicodeBCP47LocaleIdentifier;
  title: string;
};

/**
 * Plugin configuration options
 * @public
 */
export type InlineStructureProps = {
  locales?: Locale[];
  hide?: string[];
  toolTitle?: string;
  localeFieldName?: string;
};

/**
 * Main plugin options
 * @public
 */
export type DocumentOptionsProps = {structure?: InlineStructureProps};

/**
 * Common structure options
 * @public
 */
export type CommonStructureOptions = {
  icon?: React.ComponentType | React.ReactNode;
  title?: string;
  views?: (S: StructureBuilder) => (View | ViewBuilder)[];
};

/**
 * Built-in structure options
 * @public
 */
export type StructureBuiltinOptions =
  | ({
      singleton: true;
    } & CommonStructureOptions)
  | ({
      // Case 2: non-singleton (or omitted)
      singleton?: false | undefined;
      orderable?: boolean;
    } & CommonStructureOptions);

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
    structureGroup?: string;
    structureOptions?:
      | StructureBuiltinOptions
      | ((
          S: StructureBuilder,
          context: StructureResolverContext,
        ) => ListItemBuilder);
    localized?: boolean;
  }
}
