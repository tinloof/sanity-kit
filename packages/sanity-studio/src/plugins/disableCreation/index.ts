import { definePlugin } from "sanity";

import { actions } from "./actions";
import getTemplates from "./templates";
import type { DisableCreationPluginOptions } from "./types";

/**
 * The `disableCreation` plugin can be used to disable creation of documents.
 *
 * @example
 *
 * ```tsx
 * import { disableCreation } from "@tinloof/sanity-studio";
 * import schemas from "@/sanity/schemas";
 *
 * export default defineConfig({
 *   plugins: [disableCreation({ schemas: ['home', 'header', 'footer'] })],
 * });
 * ```
 *
 * @param schemas - The schema types to be disabled from creation
 * @param overrideDocumentActions - The document actions to override, defaults to publish, discardChanges, restore
 */
export const disableCreation = definePlugin<DisableCreationPluginOptions>(
	({ schemas, overrideDocumentActions }) => ({
		name: "tinloof-sanity-disable-creation",
		document: {
			actions: (prev, context) =>
				actions(prev, context, schemas, overrideDocumentActions),
		},
		schema: {
			templates: (templates) => getTemplates(templates, schemas),
		},
	}),
);
