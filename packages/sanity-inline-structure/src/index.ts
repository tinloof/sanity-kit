import * as React from "react";
import {definePlugin} from "sanity";
import {
  type StructureBuilder,
  structureTool,
  type View,
  type ViewBuilder,
} from "sanity/structure";

import {LOCALE_FIELD_NAME, TOOL_TITLE} from "./constants";
import defineDefaultDocumentNode from "./define-default-document-node";
import defineStructure from "./define-structure";
import {StructureFromDocsProps} from "./types";

/**
 * A Sanity plugin that enables document schemas to configure their own structure.
 *
 * @public
 */
export const inlineStructure = definePlugin<StructureFromDocsProps>(
  ({
    hide = [],
    locales = [],
    toolTitle = TOOL_TITLE,
    localeFieldName = LOCALE_FIELD_NAME,
  } = {}) => ({
    name: "tinloof-structure",
    plugins: [
      structureTool({
        title: toolTitle,
        structure: (S, context) =>
          defineStructure(S, context, {
            locales,
            hide,
            localeFieldName,
            toolTitle,
          }),
        defaultDocumentNode: defineDefaultDocumentNode,
      }),
    ],
  }),
);

declare module "sanity" {
  interface DocumentOptions {
    structure?: {
      group?: string;
      singleton?: boolean;
      icon?: React.ComponentType | React.ReactNode;
      title?: string;
      views?: (S: StructureBuilder) => (View | ViewBuilder)[];
      orderable?: boolean;
    };
    localized?: boolean;
  }
}
