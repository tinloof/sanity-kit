export type Locale = {
  id: Intl.UnicodeBCP47LocaleIdentifier;
  title: string;
};

export type StructureFromDocsProps = {
  locales?: Locale[];
  hide?: string[];
  toolTitle?: string;
  localeFieldName?: string;
};
