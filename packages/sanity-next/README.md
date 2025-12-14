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
- [Hooks](#hooks)
  - [useInfiniteLoad](#useinfiniteload)
  - [useInfiniteScroll](#useinfinitescroll)
  - [useInView](#useinview)
- [API Handlers](#api-handlers)
  - [createLoadMoreHandler](#createloadmorehandler)
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
import { initSanity } from "@tinloof/sanity-next/client/init";

export const {
  client,
  sanityFetch,
  SanityImage,
  resolveSanityMetadata,
  // Draft mode handler
  defineEnableDraftMode,
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
import { initSanity } from "@tinloof/sanity-next/client/init";

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
import { initSanity } from "@tinloof/sanity-next/client/init";

const i18nConfig = {
  locales: [
    { id: "en", title: "English" },
    { id: "fr", title: "Français" },
    { id: "es", title: "Español" },
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

The draft mode handler is automatically configured when you initialize Sanity with a token (via the `SANITY_API_TOKEN` environment variable).

### Usage

Create your draft mode API route with a single line:

```tsx
// app/api/draft/route.ts
export { defineEnableDraftMode as GET } from "@/data/sanity/client";
```

That's it! The `defineEnableDraftMode` handler:

- Is always defined (no TypeScript errors about undefined values)
- Automatically uses the token from your initialization
- Returns helpful error messages if not properly configured
- Handles all the draft mode setup internally

## Components

### SanityImage

An optimized image component that automatically generates responsive images with proper srcsets, LQIP support, and focal point positioning.

```tsx
import { SanityImage } from "./lib/sanity";

export default function MyComponent({ image }) {
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
import { ExitPreview } from "@tinloof/sanity-next/components/exit-preview";
import { disableDraftMode } from "@tinloof/sanity-next/actions";

export default function RootLayout({ children }) {
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

## Hooks

React hooks for implementing infinite scroll and pagination patterns with Sanity data.

### useInfiniteLoad

A high-level hook that combines infinite scroll with intersection observer for seamless pagination. This hook automatically loads more data when the user scrolls to a trigger element.

```tsx
"use client";

import { useInfiniteLoad } from "@tinloof/sanity-next/hooks";
import { BLOG_INDEX_QUERY } from "@/sanity/queries";
import type { BLOG_INDEX_QUERYResult } from "@/sanity/types";

export function BlogIndex({
  initialData,
  entriesPerPage = 12,
}: {
  initialData: BLOG_INDEX_QUERYResult;
  entriesPerPage?: number;
}) {
  const { data, hasNextPage, ref, inView, pageNumber, pagesTotal } =
    useInfiniteLoad({
      query: BLOG_INDEX_QUERY,
      initialData,
      additionalParams: {
        entriesPerPage,
        filterTag: null,
      },
    });

  return (
    <div>
      <div className="grid gap-4">
        {data?.entries?.map((post) => (
          <article key={post._id}>
            <h2>{post.title}</h2>
          </article>
        ))}
      </div>

      {hasNextPage && (
        <div ref={ref} className="text-center py-8">
          Loading more posts...
        </div>
      )}
    </div>
  );
}
```

#### Props

| Prop                  | Type                                           | Description                                 |
| --------------------- | ---------------------------------------------- | ------------------------------------------- |
| `query`               | `string`                                       | The GROQ query to execute for fetching data |
| `initialData`         | `T extends PaginatedQueryResult`               | Initial data loaded on the server           |
| `additionalParams`    | `Record<string, any>` (optional)               | Additional parameters to pass to the query  |
| `calculatePagesTotal` | `(data: T) => number` (optional)               | Custom function to calculate total pages    |
| `apiEndpoint`         | `string` (optional, default: `/api/load-more`) | API endpoint for loading more data          |

#### Returns

| Property      | Type                  | Description                                    |
| ------------- | --------------------- | ---------------------------------------------- |
| `data`        | `T`                   | Current accumulated data                       |
| `loadMore`    | `() => Promise<void>` | Function to manually trigger loading more data |
| `pageNumber`  | `number`              | Current page number (1-indexed)                |
| `hasNextPage` | `boolean`             | Whether there are more pages to load           |
| `pagesTotal`  | `number`              | Total number of pages                          |
| `ref`         | `Ref<HTMLDivElement>` | Ref to attach to trigger element               |
| `inView`      | `boolean`             | Whether the trigger element is in the viewport |

#### PaginatedQueryResult Type

Your query result should follow this structure:

```typescript
type PaginatedQueryResult = {
  entries?: Array<any>;
  entriesCount?: number;
  entriesPerPage?: number;
  [key: string]: any;
} | null;
```

#### Example with custom pagination calculation

```tsx
const { data, hasNextPage, ref } = useInfiniteLoad({
  query: BLOG_INDEX_QUERY,
  initialData,
  calculatePagesTotal: (data) => {
    // Custom logic for calculating total pages
    return Math.ceil((data?.totalCount || 0) / (data?.pageSize || 1));
  },
});
```

### useInfiniteScroll

A lower-level hook that handles the core pagination logic without intersection observer. Use this when you want to manually control when to load more data.

```tsx
"use client";

import { useInfiniteScroll } from "@tinloof/sanity-next/hooks";
import { BLOG_INDEX_QUERY } from "@/sanity/queries";

export function BlogIndex({ initialData }) {
  const { data, loadMore, pageNumber } = useInfiniteScroll({
    query: BLOG_INDEX_QUERY,
    initialData,
    additionalParams: {
      entriesPerPage: 12,
    },
  });

  return (
    <div>
      <div className="grid gap-4">
        {data?.entries?.map((post) => (
          <article key={post._id}>
            <h2>{post.title}</h2>
          </article>
        ))}
      </div>

      <button onClick={loadMore}>Load More (Page {pageNumber})</button>
    </div>
  );
}
```

#### Props

| Prop               | Type                                           | Description                 |
| ------------------ | ---------------------------------------------- | --------------------------- |
| `query`            | `string`                                       | The GROQ query to execute   |
| `initialData`      | `T extends PaginatedQueryResult`               | Initial server-loaded data  |
| `apiEndpoint`      | `string` (optional, default: `/api/load-more`) | API endpoint for pagination |
| `additionalParams` | `Record<string, any>` (optional)               | Additional query parameters |

#### Returns

| Property     | Type                  | Description                     |
| ------------ | --------------------- | ------------------------------- |
| `data`       | `T`                   | Current accumulated data        |
| `loadMore`   | `() => Promise<void>` | Function to load the next page  |
| `pageNumber` | `number`              | Current page number (1-indexed) |

#### How it works

- Automatically calculates `pageStart`, `pageEnd`, and `pageNumber` based on `entriesPerPage`
- Accumulates entries across page loads
- Merges new data with existing data
- Handles errors gracefully with console logging

### useInView

A lightweight React hook wrapper around the Intersection Observer API. Detects when an element enters the viewport.

```tsx
import { useInView } from "@tinloof/sanity-next/hooks";

export function LazySection() {
  const { inView, ref } = useInView({
    threshold: 0.5,
    rootMargin: "100px",
  });

  return (
    <div ref={ref}>
      {inView ? <ExpensiveComponent /> : <div>Scroll to load...</div>}
    </div>
  );
}
```

#### Props

| Prop         | Type                         | Description                                              |
| ------------ | ---------------------------- | -------------------------------------------------------- |
| `root`       | `Element \| null` (optional) | The element used as the viewport for checking visibility |
| `rootMargin` | `string` (optional)          | Margin around the root (e.g., "10px 20px 30px 40px")     |
| `threshold`  | `number` (optional)          | Number between 0 and 1 indicating visibility percentage  |

#### Returns

| Property | Type                  | Description                             |
| -------- | --------------------- | --------------------------------------- |
| `inView` | `boolean`             | Whether the element is in the viewport  |
| `ref`    | `Ref<HTMLDivElement>` | Ref to attach to the element to observe |

## API Handlers

Server-side utilities for handling API routes.

### createLoadMoreHandler

Creates a POST handler for pagination API routes. This handler works seamlessly with the `useInfiniteLoad` and `useInfiniteScroll` hooks.

```tsx
// app/api/load-more/route.ts
import { createLoadMoreHandler } from "@tinloof/sanity-next/api";
import { sanityFetch } from "@/data/sanity/client";

export const POST = createLoadMoreHandler(sanityFetch);

// Optional: Set max duration for long-running queries
export const maxDuration = 60;
```

#### Parameters

| Parameter     | Type                     | Description                                  |
| ------------- | ------------------------ | -------------------------------------------- |
| `sanityFetch` | `DefinedSanityFetchType` | The Sanity fetch function from `next-sanity` |

#### Request Body

The handler expects a POST request with the following JSON body:

```typescript
{
  query: string; // The GROQ query to execute
  params: {
    pageStart: number;
    pageEnd: number;
    pageNumber: number;
    entriesPerPage: number;
    // ... any additional query parameters
  }
}
```

#### Response

Returns a JSON response:

**Success:**

```typescript
{
  success: true;
  data: any; // The query result
}
```

**Error:**

```typescript
{
  success: false;
  error: string; // Error message
}
```

#### Complete Example

**1. Create the API route:**

```tsx
// app/api/load-more/route.ts
import { createLoadMoreHandler } from "@tinloof/sanity-next/api";
import { sanityFetch } from "@/data/sanity/client";

export const POST = createLoadMoreHandler(sanityFetch);
export const maxDuration = 60;
```

**2. Create your query:**

```tsx
// sanity/queries/blog.ts
import { defineQuery } from "next-sanity";

export const BLOG_INDEX_QUERY = defineQuery(`
  {
    "entries": *[
      _type == "blog.post" 
      && (!defined($filterTag) || $filterTag in tags[]->slug.current)
    ] | order(publishedAt desc) [$pageStart...$pageEnd] {
      _id,
      title,
      "pathname": pathname.current,
      publishedAt,
      authors[]-> { name, avatar }
    },
    "entriesCount": count(*[_type == "blog.post"]),
    "tags": *[_type == "blog.tag"] { _id, title, "slug": slug.current }
  }
`);
```

**3. Use in your component:**

```tsx
// app/blog/page.tsx
import { BlogIndex } from "@/components/templates/blog-index";
import { sanityFetch } from "@/data/sanity/client";
import { BLOG_INDEX_QUERY } from "@/sanity/queries/blog";

export default async function BlogPage() {
  const initialData = await sanityFetch({
    query: BLOG_INDEX_QUERY,
    params: {
      pageStart: 0,
      pageEnd: 12,
      entriesPerPage: 12,
      filterTag: null,
    },
  });

  return <BlogIndex initialData={initialData} entriesPerPage={12} />;
}
```

**4. Client component with infinite scroll:**

```tsx
// components/templates/blog-index.tsx
"use client";

import { useInfiniteLoad } from "@tinloof/sanity-next/hooks";
import { BLOG_INDEX_QUERY } from "@/sanity/queries/blog";

export function BlogIndex({ initialData, entriesPerPage }) {
  const { data, hasNextPage, ref } = useInfiniteLoad({
    query: BLOG_INDEX_QUERY,
    initialData,
    additionalParams: {
      entriesPerPage,
      filterTag: null,
    },
  });

  return (
    <div>
      {data?.entries?.map((post) => (
        <article key={post._id}>{post.title}</article>
      ))}
      {hasNextPage && <div ref={ref}>Loading...</div>}
    </div>
  );
}
```

See the [blog-next example](../../examples/blog-next) for a complete implementation.

## Utils

### Metadata Resolution

Generate comprehensive Next.js metadata from Sanity content, including SEO tags, Open Graph images, and internationalization support.

```tsx
// In your page or layout
import { resolveSanityMetadata } from "./lib/sanity";
import { loadPage } from "./lib/sanity/queries";

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string; locale: string }> },
  parentPromise: Promise<ResolvedMetadata>
) {
  const parent = await parentPromise;
  const { slug, locale } = await params;

  const data = await loadPage({ slug, locale });

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
import { NextRequest } from "next/server";
import { redirectIfNeeded } from "./lib/sanity";

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
import { generateSanitySitemap } from "./lib/sanity";

export default function Sitemap() {
  return generateSanitySitemap();
}
```

#### Multi-language

```tsx
// app/sitemap.ts
import { generateSanityI18nSitemap } from "./lib/sanity";

export default function Sitemap() {
  return generateSanityI18nSitemap();
}
```

## Server Actions

### disableDraftMode

A pre-built server action for disabling Sanity's draft mode.

```tsx
// Use the built-in action directly in your layout
import { disableDraftMode } from "@tinloof/sanity-next/actions";
import { ExitPreview } from "@tinloof/sanity-next/components/exit-preview";

export default function RootLayout({ children }) {
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
import { initSanity } from "@tinloof/sanity-next/client/init";

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
import { initSanity } from "@tinloof/sanity-next/client/init";

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
