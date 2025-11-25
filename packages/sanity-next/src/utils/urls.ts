// @ts-ignore - speakingurl types are not available, but module works at runtime
import speakingurl from "speakingurl";

export interface LocaleConfiguration {
  value: string;
  title: string;
  isDefault?: boolean;
}

export interface DocForPath extends MinimalDocForPath {}

export interface MinimalDocForPath {
  _type: string;
  _id: string;
  pathname?: string;
  locale?: LocaleConfiguration["value"];
  _updatedAt: string;
  _createdAt: string;
}

export type LocalizePathnameFn = (opts: {
  pathname: string;
  localeId?: string;
  isDefault?: boolean;
  fallbackLocaleId?: string;
}) => string;

export function stripMarginSlashes(path: string): string {
  if (typeof path !== "string") return path;

  return removeDoubleSlashes(path).replace(/^\/|\/$/g, "");
}

export function removeDoubleSlashes(path: string): string {
  if (typeof path !== "string") return path;

  return path.replace(/\/{2,}/g, "/");
}

/**
 * Generates path variations for flexible redirect matching.
 *
 * This function creates multiple variations of a path to handle different
 * URL formats that users might access. It normalizes the input and generates
 * variations with different slash combinations.
 *
 * @param path - The input path to generate variations for
 * @returns Array of path variations to match against redirect rules
 *
 * @example
 * ```tsx
 * getPathVariations("/about-us/")
 * // Returns: ["about-us", "/about-us/", "about-us/", "/about-us"]
 *
 * getPathVariations("contact")
 * // Returns: ["contact", "/contact/", "contact/", "/contact"]
 * ```
 *
 * @example
 * ```tsx
 * // The variations help match redirects regardless of how users access URLs:
 * // - "/about-us" (no trailing slash)
 * // - "/about-us/" (with trailing slash)
 * // - "about-us" (no leading slash)
 * // - "about-us/" (no leading slash, with trailing slash)
 * ```
 */
export function getPathVariations(path: string): string[] {
  if (typeof path !== "string") return [];

  let slashless = path.trim();
  if (slashless.startsWith("/")) {
    slashless = slashless.slice(1);
  }
  if (slashless.endsWith("/")) {
    slashless = slashless.slice(0, -1);
  }

  return [slashless, `/${slashless}/`, `${slashless}/`, `/${slashless}`];
}

export function formatPath(path: string): string {
  return `/${stripMarginSlashes(path)}`;
}

export function getDocumentPath(
  doc: DocForPath,
  defaultLocaleId: string,
  localizePathnameFn?: LocalizePathnameFn,
): string | undefined {
  if (typeof doc.pathname !== "string") return;

  const isDefault = doc.locale === defaultLocaleId;

  // Localize & format the final path
  return (localizePathnameFn || localizePathname)({
    pathname: doc.pathname,
    localeId: doc.locale,
    isDefault,
  });
}

export function localizePathname({
  pathname,
  localeId,
  isDefault,
}: {
  pathname: string;
  localeId?: string;
  isDefault?: boolean;
}) {
  if (typeof pathname !== "string") {
    throw new Error("Pathname is not a string");
  }

  if (!localeId || isDefault) {
    return formatPath(pathname);
  }

  return formatPath(`${localeId}${pathname}`);
}

export function stringToPathname(
  input: string,
  options?: {allowTrailingSlash?: boolean},
) {
  let sanitized = input
    // Convert to lowercase first to ensure consistent character handling
    .toLowerCase()
    // Replace spaces with dashes before any other processing
    .replace(/\s+/g, "-")
    // Remove consecutive slashes inside the path except the first character
    .replace(/(?!^)\/+/g, "/")
    .replace(/[^a-z0-9-\/]+/g, "")
    .replace(/-+/g, "-")
    // Remove duplicate slashes
    .replace(/\/+/g, "/");

  sanitized = options?.allowTrailingSlash
    ? sanitized
    : sanitized.replace(/\/$/, "");

  return (
    // Remove duplicate slashes
    `/${sanitized}`.replace(/\/+/g, "/")
  );
}

export function slugify(input: string) {
  return speakingurl(input);
}

export function isExternalUrl(url: string) {
  const regex =
    /^((http|https):\/\/)?[a-zA-Z0-9]+([-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z0-9-]{2,}(:[0-9]{1,5})?(\/.*)?$/;
  return regex.test(url);
}

export function pathToAbsUrl(args: {
  path: string;
  baseUrl: string;
}): string | undefined {
  const path = args?.path;

  if (typeof path !== "string") return;

  return args.baseUrl + (path === "/" ? "" : formatPath(path));
}
