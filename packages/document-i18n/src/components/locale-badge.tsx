import type {DocumentBadgeDescription, DocumentBadgeProps} from "sanity";

import {useDocumentI18nContext} from "./document-i18n-context";

export default function LocaleBadge(
  props: DocumentBadgeProps,
): DocumentBadgeDescription | null {
  const source = props?.draft || props?.published;
  const {localeField, locales} = useDocumentI18nContext();
  const localeId = source?.[localeField];

  if (!localeId) {
    return null;
  }

  const locale = Array.isArray(locales)
    ? locales.find((l) => l.id === localeId)
    : null;

  // Currently we only show the language id if the supportedLanguages are async
  return {
    label: locale?.id ?? String(localeId),
    title: locale?.title ?? undefined,
    color: `primary`,
  };
}
