import type {
	DocumentBadgeComponent,
	DocumentBadgesContext,
	DocumentDefinition,
	DocumentPluginOptions,
	SchemaTypeDefinition,
} from "sanity";

/**
 * Gets badges config from schema options.
 * @internal
 */
function getDocumentBadgesConfig(
	schemas: SchemaTypeDefinition[],
	schemaType: string,
): DocumentPluginOptions["badges"] {
	const schema = schemas.find((s) => s.name === schemaType);
	if (!schema || schema.type !== "document") return undefined;

	return (schema as DocumentDefinition).options?.document?.badges;
}

/**
 * Applies badges configuration from schema options.
 *
 * @example
 * ```ts
 * defineType({
 *   options: {
 *     document: {
 *       badges: (prev, context) => [
 *         ...prev,
 *         { label: 'Draft', color: 'warning' }
 *       ]
 *     }
 *   }
 * })
 * ```
 * @internal
 */
export default function defineBadges(
	prev: DocumentBadgeComponent[],
	context: DocumentBadgesContext,
): DocumentBadgeComponent[] {
	const {
		schema: { _original },
		schemaType,
	} = context;

	const { types: schemas = [] } = (_original as {
		types: SchemaTypeDefinition[];
	}) || {
		types: [],
	};

	// Get the badges configuration for this schema type
	const badgesConfig = getDocumentBadgesConfig(schemas, schemaType);

	// If no badges config is found, return the original badges unchanged
	if (!badgesConfig) {
		return prev;
	}

	// If config is an array of badges, append them to existing badges
	if (Array.isArray(badgesConfig)) {
		return [...prev, ...badgesConfig];
	}

	// If config is a function, call it with the previous badges and context
	if (typeof badgesConfig === "function") {
		return badgesConfig(prev, context);
	}

	// Fallback: return original badges if config type is unexpected
	return prev;
}
