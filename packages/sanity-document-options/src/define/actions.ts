import type {
	DocumentActionComponent,
	DocumentActionsContext,
	DocumentDefinition,
	DocumentPluginOptions,
	SchemaTypeDefinition,
} from "sanity";

/**
 * Gets actions config from schema options.
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
 * Applies actions configuration from schema options.
 *
 * @example
 * ```ts
 * defineType({
 *   options: {
 *     document: {
 *       actions: (prev, context) => prev.filter(a => a.action !== 'delete')
 *     }
 *   }
 * })
 * ```
 */
export default function defineActions(
	prev: DocumentActionComponent[],
	context: DocumentActionsContext,
): DocumentActionComponent[] {
	const {
		schema: { _original },
		schemaType,
	} = context;

	const { types: schemas = [] } = (_original as {
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
