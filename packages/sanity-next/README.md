# @tinloof/sanity-next

A comprehensive collection of Next.js utilities, components, and server actions for seamless Sanity integration. This package provides everything you need to build modern, performant Next.js applications with Sanity CMS, including internationalization support, metadata resolution, image optimization, and more.

## Installation

```sh
pnpm install @tinloof/sanity-next
```

## Table of Contents

- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Environment Variables](#environment-variables)
  - [Basic Setup](#basic-setup)
  - [With Internationalization](#with-internationalization)
- [Draft Mode](#draft-mode)
  - [Setup](#setup)
  - [Usage](#usage)
- [Components](#components)
  - [SanityImage](#sanityimage)
  - [ExitPreview](#exitpreview)
- [Utils](#utils)
  - [Metadata Resolution](#metadata-resolution)
  - [URL Utilities](#url-utilities)
  - [Redirects](#redirects)
  - [Sitemap Generation](#sitemap-generation)
- [Server Actions](#server-actions)
  - [disableDraftMode](#disabledraftmode)
- [License](#license)
- [Develop & test](#develop--test)

## Quick Start

The `initSanity` function provides a complete setup for your Next.js application with sensible defaults:

```tsx
// lib/sanity/index.ts
import {initSanity} from "@tinloof/sanity-next/client/init";

export const {
  client,
  sanityFetch,
  SanityImage,
  resolveSanityMetadata,
  // Draft mode handler
  draftRoute,
  // Redirect utilities
  redirectIfNeeded,
  // Sitemap utilities
  generateSanitySitemap,
} = initSanity();
```

## Configuration

### Environment Variables

Create a `.env.local` file with the following required variables:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your-viewer-token
SANITY_API_VERSION=2025-01-01
```

### Basic Setup

```tsx
import {initSanity} from "@tinloof/sanity-next/client/init";

export const {
  client,
  sanityFetch,
  SanityImage,
  resolveSanityMetadata,
  generateSanitySitemap,
} = initSanity({
  baseUrl: "https://yoursite.com",
  client: {
    // Override default client config
    apiVersion: "2024-01-01",
    useCdn: true,
  },
  live: {
    // Override default live config
    browserToken: process.env.SANITY_API_TOKEN,
    serverToken: process.env.SANITY_API_TOKEN,
  },
});
```

### With Internationalization

```tsx
import {initSanity} from "@tinloof/sanity-next/client/init";

const i18nConfig = {
  locales: [
    {id: "en", title: "English"},
    {id: "fr", title: "Français"},
    {id: "es", title: "Español"},
  ],
  defaultLocaleId: "en",
};

export const {
  client,
  sanityFetch,
  SanityImage,
  resolveSanityMetadata,
  // I18n-specific utilities
  generateSanityI18nSitemap,
} = initSanity({
  i18n: i18nConfig,
});
```

## Draft Mode

The package provides a streamlined way to implement Sanity's draft mode in Next.js App Router projects.

### Setup

Configure your Sanity client with a viewer token during initialization:

```tsx
// lib/sanity/index.ts
import {initSanity} from "@tinloof/sanity-next";

export const sanity = initSanity({
  // Optional: explicitly provide viewer token
  viewerToken: process.env.SANITY_VIEWER_TOKEN,
  // Or rely on SANITY_API_TOKEN env variable (default)
});
```

### Usage

Create your draft mode API route with a single line:

```tsx
// app/api/draft/route.ts
import {draftRoute} from "@/data/sanity/client";
export const {GET} = draftRoute;
```

That's it! The `draftRoute` handler:

- Is always defined (no TypeScript errors about undefined values)
- Automatically uses the token from your initialization
- Returns helpful error messages if not properly configured
- Handles all the draft mode setup internally

## Components

### SanityImage

An optimized image component that automatically generates responsive images with proper srcsets, LQIP support, and focal point positioning.

```tsx
import {SanityImage} from "./lib/sanity";

export default function MyComponent({image}) {
  return (
    <SanityImage
      data={image}
      aspectRatio="16/9"
      sizes="(min-width: 768px) 50vw, 100vw"
      lqip={true}
      fetchPriority="high"
      className="rounded-lg"
    />
  );
}
```

#### Props

| Prop            | Type                                   | Description                                                         |
| --------------- | -------------------------------------- | ------------------------------------------------------------------- |
| `data`          | `SanityImage \| null`                  | The Sanity image object from your CMS                               |
| `aspectRatio`   | `string` (optional)                    | Aspect ratio in `width/height` format (e.g., "16/9", "4/3")         |
| `sizes`         | `string` (optional)                    | Responsive sizes attribute for optimal image loading                |
| `lqip`          | `boolean` (optional, default: `false`) | Enable Low Quality Image Placeholder for smoother loading           |
| `fetchPriority` | `"high" \| "default"` (optional)       | Fetch priority for the image (use "high" for above-the-fold images) |
| `className`     | `string` (optional)                    | CSS class name                                                      |

#### Features

- **Automatic responsive images**: Generates optimal srcsets for all screen sizes
- **LQIP support**: Shows blurred placeholder while high-quality image loads
- **Focal point support**: Respects Sanity's hotspot and crop settings
- **Format optimization**: Automatically serves modern formats (WebP, AVIF) when supported
- **Performance optimized**: Lazy loading by default, with eager loading for high-priority images

### ExitPreview

A client component for exiting Sanity's draft mode with a clean, accessible interface. The component is already marked with `"use client"` so it can be used directly in server components.

```tsx
// app/layout.tsx
import {ExitPreview} from "@tinloof/sanity-next/components/exit-preview";
import {disableDraftMode} from "@tinloof/sanity-next/actions";

export default function RootLayout({children}) {
  return (
    <html>
      <body>
        {children}
        <ExitPreview disableDraftMode={disableDraftMode} />
      </body>
    </html>
  );
}
```

#### Props

| Prop               | Type                             | Description                                   |
| ------------------ | -------------------------------- | --------------------------------------------- |
| `disableDraftMode` | `() => Promise<void>`            | Server action to disable draft mode           |
| `className`        | `string` (optional)              | Custom CSS class (disables default styling)   |
| `styles`           | `React.CSSProperties` (optional) | Additional inline styles merged with defaults |

#### Features

- **Smart visibility**: Only shows when not in Sanity's Presentation Tool
- **Loading state**: Shows feedback while disabling draft mode
- **Auto-refresh**: Refreshes the page after successful disable
- **Accessible**: Proper disabled states and ARIA attributes

## Utils

### Metadata Resolution

Generate comprehensive Next.js metadata from Sanity content, including SEO tags, Open Graph images, and internationalization support.

```tsx
// In your page or layout
import {resolveSanityMetadata} from "./lib/sanity";
import {loadPage} from "./lib/sanity/queries";

export async function generateMetadata(
  {params}: {params: Promise<{slug: string; locale: string}>},
  parentPromise: Promise<ResolvedMetadata>,
) {
  const parent = await parentPromise;
  const {slug, locale} = await params;

  const data = await loadPage({slug, locale});

  if (!data) return {};

  return resolveSanityMetadata({
    parent,
    title: data.title,
    seo: data.seo,
    pathname: data.pathname,
    locale,
    translations: data.translations,
  });
}
```

#### ResolveSanityMetadata Props

| Prop           | Type                        | Description                               |
| -------------- | --------------------------- | ----------------------------------------- |
| `parent`       | `ResolvedMetadata`          | Parent metadata from Next.js              |
| `title`        | `string` (optional)         | Page title                                |
| `seo`          | `object` (optional)         | SEO configuration object                  |
| `pathname`     | `string\|object` (optional) | Page pathname or slug object              |
| `locale`       | `string` (optional)         | Current locale                            |
| `translations` | `array` (optional)          | Array of translation objects for hreflang |

### Redirects

Handle dynamic redirects managed through Sanity CMS. The `redirectIfNeeded` utility from `initSanity` provides a streamlined approach:

```tsx
// middleware.ts
import {NextRequest} from "next/server";
import {redirectIfNeeded} from "./lib/sanity";

export async function middleware(request: NextRequest) {
  // This handles the redirect logic automatically
  await redirectIfNeeded(request);
}
```

### Sitemap Generation

Generate XML sitemaps from your Sanity content. The sitemap utilities automatically find all documents that have a `pathname.current` field and are marked as indexable.

#### Single Language

```tsx
// app/sitemap.ts
import {generateSanitySitemap} from "./lib/sanity";

export default function Sitemap() {
  return generateSanitySitemap();
}
```

#### Multi-language

```tsx
// app/sitemap.ts
import {generateSanityI18nSitemap} from "./lib/sanity";

export default function Sitemap() {
  return generateSanityI18nSitemap();
}
```

## Server Actions

### disableDraftMode

A pre-built server action for disabling Sanity's draft mode.

```tsx
// Use the built-in action directly in your layout
import {disableDraftMode} from "@tinloof/sanity-next/actions";
import {ExitPreview} from "@tinloof/sanity-next/components/exit-preview";

export default function RootLayout({children}) {
  return (
    <html>
      <body>
        {children}
        {/* ExitPreview is already a client component */}
        <ExitPreview disableDraftMode={disableDraftMode} />
      </body>
    </html>
  );
}
```

## Advanced Configuration

### Custom Client Configuration

```tsx
import {initSanity} from "@tinloof/sanity-next/client/init";

export const sanity = initSanity({
  client: {
    projectId: "custom-project",
    dataset: "development",
    apiVersion: "2024-01-01",
    useCdn: false,
    perspective: "previewDrafts",
    token: process.env.SANITY_WRITE_TOKEN,
  },
  live: {
    browserToken: process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN,
    serverToken: process.env.SANITY_SERVER_TOKEN,
  },
});
```

### Custom Base URL Detection

```tsx
import {initSanity} from "@tinloof/sanity-next/client/init";

export const sanity = initSanity({
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://production-site.com",
});
```

## Requirements

- **Next.js**: ^15.0.0 || ^16.0.0
- **React**: ^18 || ^19.0.0
- **next-sanity**: ^10.0.0 || ^11.0.0

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This package uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit) with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio) on how to run this plugin with hotreload in the studio.
