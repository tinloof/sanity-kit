# @tinloof/sanity-web

A collection of Sanity-related utilities for web development.

## Table of Contents

- [Features](#features)
- [Installation](#installation)
- [Utilities](#utilities)
  - [Sitemap Generation](#sitemap-generation)
- [License](#license)
- [Develop & test](#develop--test)

## Features

- **Sitemap Generation**: Automatically generate XML sitemaps from your Sanity content
- **Internationalization Support**: Generate i18n-aware sitemaps with alternate language URLs
- **SEO Optimization**: Include last modified dates and proper URL structures

## Installation

```sh
npm install @tinloof/sanity-web
```

## Utilities

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
