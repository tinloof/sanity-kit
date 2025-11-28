import {ExtendedAbstractType} from "@tinloof/sanity-extends";

import {orderableAbstract, singletonAbstract, syncAbstract} from "../abstracts";
import {Abstracts} from "../types";

/**
 * Map of abstract option keys to their corresponding schema type definitions
 */
const ABSTRACT_SCHEMA_MAP = {
  singleton: singletonAbstract,
  sync: syncAbstract,
  orderable: orderableAbstract,
} as const;

/**
 * Type for valid abstract keys
 * @internal
 */
export type AbstractKey = keyof typeof ABSTRACT_SCHEMA_MAP;

/**
 * Resolves enabled abstract schema types based on the provided abstracts configuration
 *
 * @param abstracts - Configuration object specifying which abstracts to enable
 * @returns Array of schema type definitions for enabled abstracts
 *
 * @example
 * ```ts
 * const abstracts = { singleton: true, i18n: true };
 * const schemaTypes = resolveAbstractSchemaTypes(abstracts);
 * // Returns [singletonAbstract, i18nAbstract]
 * ```
 * @internal
 */
export function resolveAbstractSchemaTypes(
  abstracts: Abstracts = {},
): ExtendedAbstractType[] {
  if (abstracts === false) return [];

  const enabledAbstracts: ExtendedAbstractType[] = [];

  // Iterate through the abstracts configuration
  Object.entries(abstracts).forEach(([key, enabled]) => {
    if (enabled && key in ABSTRACT_SCHEMA_MAP) {
      const abstractKey = key as AbstractKey;
      enabledAbstracts.push(ABSTRACT_SCHEMA_MAP[abstractKey]);
    }
  });

  return enabledAbstracts;
}
