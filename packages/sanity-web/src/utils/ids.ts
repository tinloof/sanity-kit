const DEEP_LINK_SEPARATOR = "__" as const;

export type DeepLinkData = {
  /**
   * _key of the target deep-linked section
   */
  sectionKey?: string;
  /**
   * name of the schema field that contains this section
   */
  fieldName?: string;
  parentDocumentId?: string;
};

/**
 * Generates a unique deep link ID by combining field name and section key.
 *
 * @param deepLink - The deep link data object containing section information
 * @returns A string in the format "{fieldName}__{sectionKey}" or undefined if required fields are missing
 *
 * @example
 * ```ts
 * const deepLinkData = {
 *   sectionKey: "hero-section",
 *   fieldName: "content",
 *   parentDocumentId: "doc-123"
 * };
 *
 * const id = getDeepLinkID(deepLinkData);
 * // Returns: "content__hero-section"
 * ```
 */
export function getDeepLinkID(deepLink: DeepLinkData): string | undefined {
  if (!deepLink?.sectionKey?.trim() || !deepLink?.fieldName?.trim()) return;

  return `${deepLink.fieldName}${DEEP_LINK_SEPARATOR}${deepLink.sectionKey}`;
}
