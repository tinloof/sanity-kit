import type {SanityImageProps} from "./components/SanityImage";

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
