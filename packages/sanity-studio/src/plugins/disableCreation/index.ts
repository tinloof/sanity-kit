import { definePlugin } from "sanity";

import { actions } from "./actions";
import getTemplates from "./templates";
import { DisableCreationPluginOptions } from "./types";

/**
 * The `disableCreation` plugin can be used to disable creation of documents that have disableCreation option set to true.
 *
 * @example
 *
 * ```tsx
 * import { disableCreation } from "@tinloof/sanity-studio";
 * import schemas from "@/sanity/schemas";
 *
 * export default defineConfig({
 *   plugins: [disableCreation({ schemaTypes: schemas })],
 * });
 * ```
 *
 * ```tsx
 * import {defineType} from 'sanity'
 *
 * export default defineType({
 *   type: 'document',
 *   name: 'home',
 *   fields: [
 *     {
 *       type: 'string',
 *       name: 'title',
 *     },
 *   ],
 *   options: {
 *     disableCreation: true,
 *   },
 * })
 * ```
 *
 * @param schemaTypes - The schema types found in the studio, used to filter out templates that have disableCreation set to true
 * @param overrideDocumentActions - The document actions to override, defaults to publish, discardChanges, restore
 */
export const disableCreation = definePlugin<DisableCreationPluginOptions>(
  ({ schemaTypes, overrideDocumentActions }) => ({
    name: "tinloof-sanity-disable-creation",
    document: {
      actions: (prev, context) =>
        actions(prev, context, overrideDocumentActions),
    },
    schema: {
      templates: (templates) => getTemplates(templates, schemaTypes),
    },
  })
);
