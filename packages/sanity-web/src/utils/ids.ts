export type DeepLinkData = {
	/**
	 * _key of the target deep-linked section
	 */
	sectionKey?: string;
	/**
	 * @deprecated No longer used - deep link IDs are now based solely on sectionKey
	 */
	fieldName?: string;
	parentDocumentId?: string;
};

/**
 * Generates a unique deep link ID from the section key.
 *
 * @param deepLink - The deep link data object containing section information
 * @returns The section key as the ID, or undefined if sectionKey is missing
 *
 * @example
 * ```ts
 * const deepLinkData = {
 *   sectionKey: "hero-section",
 *   parentDocumentId: "doc-123"
 * };
 *
 * const id = getDeepLinkID(deepLinkData);
 * // Returns: "hero-section"
 * ```
 */
export function getDeepLinkID(deepLink: DeepLinkData): string | undefined {
	if (!deepLink?.sectionKey?.trim()) return;

	return deepLink.sectionKey;
}
