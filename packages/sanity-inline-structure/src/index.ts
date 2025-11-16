import {definePlugin} from "sanity";
import {
  type ListItemBuilder,
  type StructureBuilder,
  type StructureResolverContext,
  structureTool,
} from "sanity/structure";

import {LOCALE_FIELD_NAME, TOOL_TITLE} from "./constants";
import defineDefaultDocumentNode from "./define-default-document-node";
import defineStructure from "./define-structure";
import {InlineStructureProps, StructureBuiltinOptions} from "./types";

// Re-export types for external use
export type {StructureBuiltinOptions} from "./types";

/**
 * A Sanity plugin that enables document schemas to configure their own structure.
 *
 * @public
 */
export const inlineStructure = definePlugin<InlineStructureProps>(
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
    structureGroup?: string;
    structureOptions?:
      | StructureBuiltinOptions
      | ((
          S: StructureBuilder,
          context: StructureResolverContext,
        ) => ListItemBuilder);
  }
}
