import type {SanityImageProps} from "../components/sanity-image";

export interface DocForPath extends MinimalDocForPath {}

export interface MinimalDocForPath {
  _type: string;
  _id: string;
  pathname?: string;
  locale?: LocaleConfiguration["value"];
  _updatedAt: string;
  _createdAt: string;
}

export interface LocaleConfiguration {
  /**
   * If adding full locales (English, USA) instead of just plain languages (English), they should
   * be formatted according to RFC 5646: Tags for Identifying Languages (also known as BCP 47).
   *
   * Example: `en-us` instead of `en_us`.
   *
   * Capitalized or not, it doesn't make a difference - we'll make them all lowercase.
   */
  value: string;
  title: string;
  isDefault?: boolean;
}

export {SanityImageProps};

export type LocalizePathnameFn = (opts: {
  pathname: string;
  localeId?: string;
  isDefault?: boolean;
  fallbackLocaleId?: string;
}) => string;

export type Locale = {
  id: string;
  title: string;
};

export type i18nConfig<T extends readonly Locale[] = Locale[]> = {
  locales: T;
  defaultLocaleId?: T[number]["id"];
};
