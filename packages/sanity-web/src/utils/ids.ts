/**
 * @deprecated This entire module is deprecated. Use the section's `_key` directly as the ID.
 */

/**
 * @deprecated Use the section's `_key` directly instead
 */
export type DeepLinkData = {
	/**
	 * _key of the target deep-linked section
	 */
	sectionKey?: string;
	/**
	 * @deprecated No longer used - deep link IDs are now based solely on sectionKey
	 */
	fieldName?: never;
	parentDocumentId?: string;
};

/**
 * Generates a unique deep link ID from the section key.
 *
 * @deprecated This function is no longer used. Just use the sectionKey directly as the ID.
 *
 * @param deepLink - The deep link data object containing section information
 * @returns The section key as the ID, or undefined if sectionKey is missing
 *
 * @example
 * ```ts
 * // Instead of:
 * const id = getDeepLinkID({ sectionKey: "hero-section" });
 *
 * // Just use:
 * const id = sectionKey;
 * ```
 */
export function getDeepLinkID(deepLink: DeepLinkData): string | undefined {
	if (!deepLink?.sectionKey?.trim()) return;

	return deepLink.sectionKey;
}
