import {isExternalUrl} from "../utils";
import Link, {type LinkProps} from "next/link";
import React, {type AnchorHTMLAttributes, forwardRef} from "react";

/**
 * Props for the DynamicLink component.
 *
 * @description Extends standard HTML anchor element attributes with Next.js Link functionality.
 * The component automatically detects internal vs external URLs and renders accordingly.
 *
 * @example
 * ```tsx
 * // Internal link (uses Next.js Link)
 * <DynamicLink href="/about">About Us</DynamicLink>
 *
 * // External link (uses regular anchor tag)
 * <DynamicLink href="https://example.com">External Site</DynamicLink>
 *
 * // With additional props
 * <DynamicLink
 *   href="/contact"
 *   prefetch={false}
 *   className="custom-link"
 * >
 *   Contact
 * </DynamicLink>
 * ```
 */
export type DynamicLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Partial<LinkProps> & {
    /** Optional key for React list rendering */
    _key?: string;
    /**
     * The URL to link to. Can be internal (relative/absolute path) or external (full URL).
     * @default "/"
     */
    href?: string;
  };

/**
 * A smart link component that automatically detects whether a URL is internal or external.
 *
 * @description This component intelligently chooses between Next.js Link (for internal URLs)
 * and a regular anchor tag (for external URLs). It provides a unified interface for linking
 * while optimizing performance for internal navigation and ensuring proper security attributes
 * for external links.
 *
 * @features
 * - **Automatic URL detection**: Detects internal vs external URLs
 * - **Performance optimization**: Uses Next.js Link for internal navigation
 * - **Security**: Automatically adds `rel="noopener noreferrer"` and `target="_blank"` for external links
 * - **Accessibility**: Maintains proper anchor semantics and keyboard navigation
 * - **Forward ref support**: Allows ref forwarding to the underlying anchor element
 *
 * @param props - The component props extending DynamicLinkProps
 * @param ref - Forwarded ref to the anchor element
 *
 * @returns A React element that renders either a Next.js Link or anchor tag
 *
 * @example
 * ```tsx
 * // Basic usage
 * <DynamicLink href="/dashboard">Go to Dashboard</DynamicLink>
 *
 * // External link
 * <DynamicLink href="https://github.com">GitHub</DynamicLink>
 *
 * // With ref
 * const linkRef = useRef<HTMLAnchorElement>(null);
 * <DynamicLink ref={linkRef} href="/profile">Profile</DynamicLink>
 *
 * // Custom styling and attributes
 * <DynamicLink
 *   href="/blog"
 *   className="text-blue-500 hover:underline"
 *   prefetch={false}
 *   scroll={false}
 * >
 *   Blog Posts
 * </DynamicLink>
 * ```
 *
 * @see {@link https://nextjs.org/docs/api-reference/next/link} Next.js Link documentation
 * @since 1.0.0
 */
const DynamicLink: React.ForwardRefExoticComponent<
  React.PropsWithChildren<DynamicLinkProps> &
    React.RefAttributes<HTMLAnchorElement>
> = forwardRef<HTMLAnchorElement, React.PropsWithChildren<DynamicLinkProps>>(
  ({href = "/", prefetch = true, scroll, children, ...rest}, ref) => {
    const isExternal = isExternalUrl(href);

    if (isExternal) {
      return (
        <a
          {...rest}
          href={href}
          ref={ref}
          rel="noopener noreferrer"
          target="_blank"
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        prefetch={prefetch}
        scroll={scroll ?? true}
        legacyBehavior
        passHref
      >
        <a {...rest} ref={ref}>
          {children}
        </a>
      </Link>
    );
  },
);

export default DynamicLink;
