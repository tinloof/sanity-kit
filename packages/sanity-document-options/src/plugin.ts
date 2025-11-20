import {definePlugin} from "sanity";
import {structureTool} from "sanity/structure";

import {LOCALE_FIELD_NAME, TOOL_TITLE} from "./constants";
import {
  defineActions,
  defineBadges,
  defineDefaultDocumentNode,
  defineNewDocumentOptions,
  defineStructure,
  defineTemplates,
} from "./define";
import {DocumentOptionsProps} from "./types";

/**
 * Configure document options and structure directly in schema definitions.
 *
 * @example
 * ```ts
 * export default defineConfig({
 *   plugins: [documentOptions()]
 * });
 * ```
 * @public
 */
export const documentOptions = definePlugin<DocumentOptionsProps>((props) => {
  const {structure} = props ?? {};
  const {
    hide = [],
    localeFieldName = LOCALE_FIELD_NAME,
    locales = [],
    toolTitle = TOOL_TITLE,
  } = structure ?? {};

  return {
    name: "tinloof-document-options",
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
    document: {
      actions: defineActions,
      newDocumentOptions: defineNewDocumentOptions,
      badges: defineBadges,
    },
    schema: {
      templates: defineTemplates,
    },
  };
});
