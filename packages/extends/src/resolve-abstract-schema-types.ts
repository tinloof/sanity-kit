import type { DocumentDefinition } from "sanity";
import type { ExtendedType } from "./types";

/**
 * Generic utility for resolving abstract schema types from configuration
 *
 * This function filters and optionally wraps abstract schema types based on
 * a configuration object that specifies which abstracts should be enabled.
 *
 * @param abstractSchemaMap - Map of abstract keys to their schema definitions
 * @param abstracts - Configuration object specifying which abstracts to enable
 * @param options - Optional configuration passed to abstract resolvers
 * @returns Array of enabled abstract schema types
 *
 * @example
 * ```ts
 * const schemaMap = {
 *   singleton: singletonAbstract,
 *   sync: syncAbstract,
 * } as const;
 *
 * const abstracts = { singleton: true, sync: false };
 * const types = resolveAbstractSchemaTypes(schemaMap, abstracts);
 * // Returns: [singletonAbstract]
 * ```
 *
 * @example
 * // With options that get merged into resolver calls
 * ```ts
 * const types = resolveAbstractSchemaTypes(
 *   schemaMap,
 *   { singleton: true },
 *   { apiVersion: '2024-01-01' }
 * );
 * ```
 */
export function resolveAbstractSchemaTypes<
	T extends Record<string, ExtendedType>,
>(
	abstractSchemaMap: T,
	abstracts: Partial<Record<keyof T, boolean>> | false = {},
	options?: Record<string, unknown>,
): ExtendedType[] {
	if (abstracts === false) return [];

	const enabledAbstracts: ExtendedType[] = [];

	Object.entries(abstracts).forEach(([key, enabled]) => {
		if (enabled && key in abstractSchemaMap) {
			const abstractResolver = abstractSchemaMap[key as keyof T];

			if (options && typeof abstractResolver === "function") {
				const wrappedResolver = (
					schema: DocumentDefinition,
					resolverOptions?: object | boolean,
				) => {
					const baseOptions =
						typeof resolverOptions === "object" ? resolverOptions : {};
					return abstractResolver(schema, { ...baseOptions, ...options });
				};
				enabledAbstracts.push(wrappedResolver);
			} else {
				enabledAbstracts.push(abstractResolver);
			}
		}
	});

	return enabledAbstracts;
}
