import {resolveAbstractSchemaTypes} from "@tinloof/sanity-extends";
import {definePlugin} from "sanity";
import {structureTool} from "sanity/structure";

import {ABSTRACTS_MAP} from "./abstracts";
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
 *
 * @example Disable structure tool
 * ```ts
 * export default defineConfig({
 *   plugins: [documentOptions({ structure: false })]
 * });
 * ```
 * @public
 */
export const documentOptions = definePlugin<DocumentOptionsProps>((props) => {
  const {
    structure,
    abstracts = {orderable: true, singleton: true, sync: true},
  } = props ?? {};

  // Resolve enabled abstract schema types
  const enabledAbstractTypes = resolveAbstractSchemaTypes(
    ABSTRACTS_MAP,
    abstracts,
  );

  // Skip structure tool if explicitly disabled
  if (structure === false) {
    return {
      name: "tinloof-document-options",
      document: {
        actions: defineActions,
        newDocumentOptions: defineNewDocumentOptions,
        badges: defineBadges,
      },
      schema: {
        templates: defineTemplates,
        types: enabledAbstractTypes,
      },
    };
  }

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
      types: enabledAbstractTypes,
    },
  };
});
