import * as React from "react";
import {
  type StructureBuilder,
  type View,
  type ViewBuilder,
} from "sanity/structure";

export type Locale = {
  id: Intl.UnicodeBCP47LocaleIdentifier;
  title: string;
};

export type InlineStructureProps = {
  locales?: Locale[];
  hide?: string[];
  toolTitle?: string;
  localeFieldName?: string;
};

export type CommonStructureOptions = {
  icon?: React.ComponentType | React.ReactNode;
  title?: string;
  views?: (S: StructureBuilder) => (View | ViewBuilder)[];
};

/**
 * Built-in structure options for document schemas.
 *
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
