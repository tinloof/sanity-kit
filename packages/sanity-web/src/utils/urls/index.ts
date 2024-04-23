import speakingurl from "speakingurl";
import { DocForPath } from "../../types";
import { Slug } from "sanity";

/**
 * Removes leading and trailing slashes from a string.
 */
export function stripMarginSlashes(path: string): string {
  if (typeof path !== "string") return path;

  return removeDoubleSlashes(path).replace(/^\/|\/$/g, "");
}

export function removeDoubleSlashes(path: string): string {
  if (typeof path !== "string") return path;

  return path.replace(/\/{2,}/g, "/");
}

/**
 * As we can't be 100% sure editors will always format their paths/slugs properly (without leading or trailing slashes),
 * we run queries against a set of possible slash variations.
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

  return [
    slashless,
    // /slash-on-both-ends/
    `/${slashless}/`,
    // trailing/
    `${slashless}/`,
    // /leading
    `/${slashless}`,
  ];
}

export function formatPath(path: string): string {
  return `/${stripMarginSlashes(path)}`;
}

export function getDocumentPath(
  doc: DocForPath,
  defaultLocaleId: string
): string | undefined {
  if (typeof doc.pathname !== "string") return;

  const isDefault = doc.locale === defaultLocaleId;

  // Localize & format the final path
  return localizePathname({
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
    return;
  }

  if (!localeId || isDefault) {
    return formatPath(pathname);
  }

  return formatPath(`${localeId}${pathname}`);
}

export function stringToPathname(
  input: string,
  options?: { allowTrailingSlash?: boolean }
) {
  let sanitized = input
    // Convert to lowercase first to ensure consistent character handling
    .toLowerCase()
    // Replace spaces with dashes before any other processing
    .replace(/\s+/g, "-")
    // Remove consecutive slashes inside the path except the first character
    .replace(/(?!^)\/+/g, "/")
    // Remove non-URL friendly characters, allowing internal slashes and dashes
    .replace(/[^a-z0-9-\/]+/g, "")
    // Prevent multiple dashes in a row (optional, for aesthetics)
    .replace(/-+/g, "-")
    // Remove duplicate slashes
    .replace(/\/+/g, "/");

  sanitized = options?.allowTrailingSlash
    ? sanitized
    : sanitized.replace(/\/$/, "");

  return (
    `/${sanitized}`
      // Remove duplicate slashes
      .replace(/\/+/g, "/")
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
  path: Slug | null | string;
  baseUrl: string;
}): string | undefined {
  const path = args?.path;

  if (typeof path !== "string") return;

  return (
    args.baseUrl +
    // When creating absolute URLs, ensure the homepage doesn't have a trailing slash
    (path === "/" ? "" : formatPath(path))
  );
}
