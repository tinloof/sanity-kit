import {
  DocumentActionComponent,
  DocumentActionsContext,
  DocumentDefinition,
  DocumentPluginOptions,
  type SchemaTypeDefinition,
} from "sanity";

/**
 * Retrieves the actions configuration from a document schema type's options.
 *
 * @param schemas - Array of schema type definitions from the Sanity schema
 * @param schemaType - The name of the schema type to get actions config for
 * @returns The actions configuration if found, undefined otherwise
 *
 * @internal
 */
function getDocumentActionsConfig(
  schemas: SchemaTypeDefinition[],
  schemaType: string,
): DocumentPluginOptions["actions"] {
  const schema = schemas.find((s) => s.name === schemaType);
  if (!schema || schema.type !== "document") return undefined;

  return (schema as DocumentDefinition).options?.document?.actions;
}

/**
 * A document actions resolver that automatically applies actions configuration
 * from document schemas created with `defineDocument` and `definePage` utilities.
 *
 * This function reads the `actions` option from your document schemas and applies
 * the appropriate filtering/customization to the available document actions in
 * Sanity Studio.
 *
 * **Usage:**
 * ```ts
 * // In your sanity.config.ts
 * import {defineActions} from "@tinloof/sanity-studio";
 *
 * export default defineConfig({
 *   document: {
 *     actions: defineActions, // Enable automatic actions filtering
 *   },
 * });
 * ```
 *
 * **Schema Configuration:**
 * The actions are configured in your document schemas using the `actions` option:
 *
 * ```ts
 * defineDocument({
 *   name: "post",
 *   title: "Post",
 *   fields: [
 *     // ... your fields
 *   ],
 *   options: {
 *     actions: (prev, context) => {
 *       // Custom actions function
 *       return prev.filter(action => action.action !== 'delete');
 *     },
 *     // OR array of additional actions:
 *     // actions: [customAction1, customAction2],
 *   },
 * });
 * ```
 *
 * **Supported Configuration Types:**
 * - **Function**: `(prev, context) => DocumentActionComponent[]` - Custom resolver function
 * - **Array**: `DocumentActionComponent[]` - Additional actions to append to existing ones
 *
 * @param prev - The existing document action components from Sanity and other plugins
 * @param context - The document actions context containing schema information and document data
 * @returns The filtered/modified array of document action components
 *
 * @example
 * ```ts
 * // Custom function that removes delete action for published documents
 * defineDocument({
 *   name: "article",
 *   title: "Article",
 *   fields: [...],
 *   options: {
 *     actions: (prev, context) => {
 *       if (context.published) {
 *         return prev.filter(action => action.action !== 'delete');
 *       }
 *       return prev;
 *     },
 *   },
 * });
 *
 * // Array of custom actions to add
 * defineDocument({
 *   name: "page",
 *   title: "Page",
 *   fields: [...],
 *   options: {
 *     actions: [customPreviewAction, customAnalyticsAction],
 *   },
 * });
 * ```
 *
 * @see {@link https://www.sanity.io/docs/document-actions Document Actions Documentation}
 */
export default function defineActions(
  prev: DocumentActionComponent[],
  context: DocumentActionsContext,
): DocumentActionComponent[] {
  const {
    schema: {_original},
    schemaType,
  } = context;

  const {types: schemas = []} = (_original as {
    types: SchemaTypeDefinition[];
  }) || {
    types: [],
  };

  // Get the actions configuration for this schema type
  const actionsConfig = getDocumentActionsConfig(schemas, schemaType);

  // If no actions config is found, return the original actions unchanged
  if (!actionsConfig) {
    return prev;
  }

  // If config is an array of actions, append them to existing actions
  if (Array.isArray(actionsConfig)) {
    return [...prev, ...actionsConfig];
  }

  // If config is a function, call it with the previous actions and context
  if (typeof actionsConfig === "function") {
    return actionsConfig(prev, context);
  }

  // Fallback: return original actions if config type is unexpected
  return prev;
}
