# @tinloof/sanity-web

A collection of Sanity-related utilities for web development.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Utilities](#utilities)
  - [DynamicLink Component](#dynamiclink-component)
  - [LocalizedLink Component](#localizedlink-component)
  - [useLocale Hook](#uselocale-hook)
  - [getLocale Utility](#getlocale-utility)
  - [Sitemap Generation](#sitemap-generation)
- [License](#license)
- [Develop & test](#develop--test)

## Features

- **Sitemap Generation**: Automatically generate XML sitemaps from your Sanity content
- **Internationalization Support**: Generate i18n-aware sitemaps with alternate language URLs
- **SEO Optimization**: Include last modified dates and proper URL structures
- **Smart Link Component**: DynamicLink component that automatically handles internal and external links

## Installation

```sh
npm install @tinloof/sanity-web
```

## Utilities

### DynamicLink Component

A smart link component that automatically detects whether a URL is internal or external and renders the appropriate link element.

#### Basic Usage

```tsx
import {DynamicLink} from "@tinloof/sanity-web";

// Internal link - renders as Next.js Link
<DynamicLink href="/about">About Us</DynamicLink>

// External link - renders as anchor tag with security attributes
<DynamicLink href="https://example.com">External Site</DynamicLink>
```

#### Props

The `DynamicLink` component accepts all standard anchor tag props plus:

- `href?: string` - The URL to link to
- `scroll?: boolean` - Whether to scroll to top on navigation (internal links only)
- `prefetch?: boolean` - Whether to prefetch the link (internal links only, defaults to `true`)
- `_key?: string` - Optional key prop

#### Features

- **Automatic Detection**: Determines if a URL is internal or external
- **Security**: External links automatically get `rel="noopener noreferrer"` and `target="_blank"`
- **Next.js Integration**: Internal links use Next.js `Link` component for optimal performance
- **Accessibility**: Both link types get `tabIndex={0}` for keyboard navigation

### LocalizedLink Component

A link component that automatically localizes URLs based on the current locale in internationalized applications.

#### Basic Usage

```tsx
import {LocalizedLink} from "@tinloof/sanity-web";
import i18n from "@/config/i18n";

// Automatically localizes the href based on current locale
<LocalizedLink href="/about" i18n={i18n}>
  About Us
</LocalizedLink>;

// For Spanish locale, this would render as href="/es/about"
// For default locale (e.g., English), this would render as href="/about"
```

#### Creating a Pre-configured Component

You can create a LocalizedLink component with pre-configured i18n settings:

```tsx
import {createLocalizedLink} from "@tinloof/sanity-web";
import i18n from "@/config/i18n";

// Create a pre-configured component
const LocalizedLink = createLocalizedLink(i18n);

// Use without passing i18n prop
<LocalizedLink href="/contact">Contact</LocalizedLink>;
```

#### Props

The `LocalizedLink` component accepts all Next.js `LinkProps` (except `href`) plus:

- `href: string` - The URL to link to (will be automatically localized)
- `children: React.ReactNode` - The link content
- `className?: string` - CSS class name
- `i18n?: i18nConfig` - Internationalization configuration (required unless using `createLocalizedLink`)

#### Smart Localization Logic

The component intelligently handles different URL types:

- **Internal paths**: `/about` → `/es/about` (for Spanish locale)
- **External URLs**: `https://example.com` → No localization applied
- **Relative paths**: `./page` or `#section` → No localization applied
- **Already localized**: `/es/about` → No additional localization applied
- **Default locale**: Uses base path without locale prefix

#### Requirements

- Must be used within a `[locale]` route structure in your Next.js app
- Requires the `useLocale` hook to access current locale from URL params

### useLocale Hook

A React hook that provides access to the current locale information in internationalized applications.

#### Basic Usage

```tsx
import {useLocale} from "@tinloof/sanity-web";
import i18n from "@/config/i18n";

function MyComponent() {
  const {locale, isDefault} = useLocale(i18n);

  return (
    <div>
      <p>Current locale: {locale.id}</p>
      <p>Locale title: {locale.title}</p>
      <p>Is default locale: {isDefault}</p>
    </div>
  );
}
```

#### Parameters

- `i18n: i18nConfig` - Internationalization configuration object

#### Returns

The hook returns an object with:

- `locale: {id: string, title: string}` - The current locale object
- `isDefault: boolean` - Whether the current locale is the default locale

#### Requirements

- Must be used within a `[locale]` route structure in your Next.js app
- The component must be a client component (marked with `"use client"`)
- Requires locale parameter to be available in the URL (e.g., `/en/page` or `/es/page`)

#### Error Handling

The hook will throw an error if used outside of a `[locale]` route:

```
"Only use this hook under the `[locale]` routes"
```

### getLocale Utility

A utility function that retrieves a locale object from a list of locales based on a locale ID.

#### Basic Usage

```ts
import {getLocale} from "@tinloof/sanity-web";
import i18n from "@/config/i18n";

// Get a specific locale
const currentLocale = getLocale("es", i18n.locales);
// Returns: {id: "es", title: "Spanish"}

// Fallback to first locale if not found
const fallbackLocale = getLocale("nonexistent", i18n.locales);
// Returns: i18n.locales[0] (the first locale in the array)
```

#### Parameters

- `locale: string` - The locale ID to search for
- `locales: Locale[]` - Array of locale objects to search in

#### Returns

- `Locale` - The matching locale object, or the first locale in the array if no match is found

#### Type Definition

```ts
type Locale = {
  id: string;
  title: string;
};
```

#### Features

- **Safe Fallback**: Always returns a locale object, never undefined
- **Simple Lookup**: Finds locale by ID with O(n) search
- **Default Behavior**: Falls back to the first locale in the array if the requested locale isn't found

### Sitemap Generation

This package provides utilities to generate XML sitemaps for your Next.js application using Sanity CMS data.

#### Basic Sitemap

For single-language sites, use `GenerateSanitySitemap`:

```ts
// app/sitemap.ts
import {GenerateSanitySitemap} from "@tinloof/sanity-web";
import {sanityFetch} from "@/data/sanity/live";

export default async function sitemap() {
  return GenerateSanitySitemap({
    sanityFetch,
    websiteBaseURL: "https://yoursite.com",
  });
}
```

#### Internationalized Sitemap

For multi-language sites, use `GenerateSanityI18nSitemap`:

```ts
// app/sitemap.ts
import {GenerateSanityI18nSitemap} from "@tinloof/sanity-web";
import i18n from "@/config/i18n";
import website from "@/config/website";
import {sanityFetch} from "@/data/sanity/live";

export default async function sitemap() {
  return GenerateSanityI18nSitemap({
    sanityFetch,
    websiteBaseURL: website.baseUrl,
    i18n,
  });
}
```

### Required Sanity Schema Fields

Your Sanity documents need these fields for the sitemap to work:

```ts
// In your document schemas
{
  name: 'pathname',
  title: 'Pathname',
  type: 'slug',
},
{
  name: 'indexable',
  title: 'Include in sitemap',
  type: 'boolean',
  initialValue: true,
},
// For i18n support
{
  name: 'locale',
  title: 'Locale',
  type: 'string',
}
```

### i18n Configuration

The i18n configuration object should follow this structure:

```ts
// config/i18n.ts
export default {
  defaultLocaleId: "en",
  locales: [
    {id: "en", title: "English"},
    {id: "es", title: "Spanish"},
    {id: "fr", title: "French"},
  ],
};
```

#### API Reference

##### GenerateSanitySitemap

Generates a basic sitemap for single-language sites.

**Parameters:**

- `sanityFetch`: Your configured Sanity fetch function
- `websiteBaseURL`: The base URL of your website (e.g., "https://example.com")

**Returns:** Promise<MetadataRoute.Sitemap>

##### GenerateSanityI18nSitemap

Generates an internationalized sitemap with alternate language URLs.

**Parameters:**

- `sanityFetch`: Your configured Sanity fetch function
- `websiteBaseURL`: The base URL of your website
- `i18n`: Internationalization configuration object

**Returns:** Promise<MetadataRoute.Sitemap>

The generated sitemap includes:

- Proper URL structure for each locale
- `hreflang` alternate URLs for translations
- `x-default` URLs pointing to the default locale
- Last modified dates from Sanity's `_updatedAt` field

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
