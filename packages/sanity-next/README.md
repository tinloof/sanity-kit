# @tinloof/sanity-next

A comprehensive collection of Next.js utilities, components, and hooks for seamless Sanity integration. This package provides everything you need to build modern, performant Next.js applications with Sanity CMS, including internationalization support, metadata resolution, image optimization, infinite scroll, and more.

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
- [Components](#components)
  - [SanityImage](#sanityimage)
  - [ExitPreview](#exitpreview)
  - [InfiniteScroll](#infinitescroll)
- [Hooks](#hooks)
  - [useInfiniteQuery](#useinfinitequery)
  - [useInView](#useinview)
- [Utils](#utils)
  - [Metadata Resolution](#metadata-resolution)
  - [Redirects](#redirects)
  - [Sitemap Generation](#sitemap-generation)
- [Server Actions](#server-actions)
- [Advanced Configuration](#advanced-configuration)
- [Types](#types)
- [Requirements](#requirements)
- [License](#license)

## Quick Start

The `initSanity` function provides a complete setup for your Next.js application with sensible defaults:

```tsx
// lib/sanity/index.ts
import { initSanity } from "@tinloof/sanity-next";

export const {
  client,
  clientWithToken,
  sanityFetch,
  SanityImage,
  resolveSanityMetadata,
  defineEnableDraftMode,
  redirectIfNeeded,
  generateSitemap,
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
import { initSanity } from "@tinloof/sanity-next";

export const {
  client,
  clientWithToken,
  sanityFetch,
  SanityImage,
  resolveSanityMetadata,
  generateSitemap,
  defineEnableDraftMode,
  redirectIfNeeded,
} = initSanity({
  baseUrl: "https://yoursite.com",
  client: {
    // Override default client config
    apiVersion: "2024-01-01",
    useCdn: true,
  },
});
```

### With Internationalization

```tsx
import { initSanity } from "@tinloof/sanity-next";

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
  generateSitemap,
  localizePathname,
} = initSanity({
  i18n: i18nConfig,
});
```

## Draft Mode

The package provides a streamlined way to implement Sanity's draft mode in Next.js App Router projects. The draft mode handler is automatically configured when you initialize Sanity with a token.

Create your draft mode API route:

```tsx
// app/api/draft/route.ts
import { defineEnableDraftMode } from "@/lib/sanity";

export { defineEnableDraftMode as GET };
```

The `defineEnableDraftMode` handler:

- Automatically uses the token from your initialization
- Returns helpful error messages if not properly configured
- Handles all the draft mode setup internally

## Components

### SanityImage

An optimized image component that automatically generates responsive images with proper srcsets, LQIP support, and focal point positioning.

```tsx
import { SanityImage } from "@/lib/sanity";

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

A client component for exiting Sanity's draft mode with a clean, accessible interface.

```tsx
// app/layout.tsx
import { ExitPreview } from "@tinloof/sanity-next/components/exit-preview";
import { disableDraftMode } from "@tinloof/sanity-next/actions/disable-draft-mode";

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

### InfiniteScroll

An opinionated render-props component for infinite scrolling with Sanity data. Combines `useInfiniteQuery` and `useInView` for automatic or manual infinite loading with sensible defaults.

#### Query Structure

Your GROQ query should be structured to support pagination with the following params:

- `$pageStart` - The starting index (0-based)
- `$pageEnd` - The ending index (exclusive)
- `$pageNumber` - The current page number (0-based)
- `$entriesPerPage` - The number of entries per page

The query result should include:

- An array of entries (default key: `"entries"`, configurable via `entriesKey`)
- A total count (default key: `"entriesCount"`, configurable via `countKey`)

```groq
{
  "entries": *[_type == "post"] | order(publishedAt desc) [$pageStart...$pageEnd] {
    _id,
    title,
    slug,
    publishedAt
  },
  "entriesCount": count(*[_type == "post"])
}
```

With filters:

```groq
{
  "entries": *[_type == "post" && ($filterTag == null || $filterTag in tags[]->slug.current)]
    | order(publishedAt desc) [$pageStart...$pageEnd] {
    _id,
    title,
    slug
  },
  "entriesCount": count(*[_type == "post" && ($filterTag == null || $filterTag in tags[]->slug.current)])
}
```

#### Basic Usage

```tsx
"use client";

import { InfiniteScroll } from "@tinloof/sanity-next/components/infinite-scroll";
import { client } from "@/lib/sanity";

export function BlogList({ initialData }) {
  return (
    <InfiniteScroll
      client={client}
      query={POSTS_QUERY}
      initialData={initialData}
      pageSize={10}
    >
      {({ data, hasMore, ref }) => (
        <>
          <div className="grid gap-4">
            {data?.entries?.map((post) => (
              <article key={post._id}>
                <h2>{post.title}</h2>
              </article>
            ))}
          </div>
          {hasMore && <div ref={ref}>Loading more...</div>}
        </>
      )}
    </InfiniteScroll>
  );
}
```

#### With Additional Params

```tsx
<InfiniteScroll
  client={client}
  query={BLOG_INDEX_QUERY}
  initialData={initialData}
  pageSize={10}
  params={{ filterTag: tagParam ?? null }}
>
  {({ data, hasMore, loadMore }) => (
    <>
      <div className="grid">
        {data?.entries?.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
      {hasMore && <button onClick={loadMore}>Load More</button>}
    </>
  )}
</InfiniteScroll>
```

#### With Draft Mode Support

```tsx
<InfiniteScroll
  client={client}
  query={BLOG_INDEX_QUERY}
  initialData={initialData}
  pageSize={10}
  draftPageSize={500}
  params={{ filterTag: tagParam ?? null }}
>
  {({ data, hasMore, ref }) => (
    // ...
  )}
</InfiniteScroll>
```

#### Props

| Prop                  | Type                                  | Description                                                |
| --------------------- | ------------------------------------- | ---------------------------------------------------------- |
| `client`              | `SanityClient`                        | The Sanity client instance                                 |
| `query`               | `string`                              | The GROQ query to execute                                  |
| `initialData`         | `T`                                   | Initial data for SSR hydration (first page)                |
| `pageSize`            | `number`                              | Number of entries per page                                 |
| `params`              | `Record<string, unknown>` (optional)  | Additional query params (merged with pagination params)    |
| `draftPageSize`       | `number` (optional, default: `500`)   | Page size for draft/preview mode (fetches all at once)     |
| `entriesKey`          | `string` (optional, default: `"entries"`)      | Key in query result containing the entries array  |
| `countKey`            | `string` (optional, default: `"entriesCount"`) | Key in query result containing the total count    |
| `hasMore`             | `(pages) => boolean` (optional)       | Custom function to determine if more pages exist           |
| `children`            | `(renderProps) => ReactNode`          | Render function receiving scroll state                     |
| `autoLoad`            | `boolean` (optional, default: `true`) | Auto-load when trigger element is in view                  |
| `intersectionOptions` | `IntersectionObserverInit` (optional) | Options for the intersection observer                      |
| `swrOptions`          | `SWRInfiniteConfiguration` (optional) | SWR configuration options                                  |

#### InfiniteScrollBase

For advanced use cases requiring full control over `params`, `select`, and `hasMore` logic, use `InfiniteScrollBase`:

```tsx
import { InfiniteScrollBase } from "@tinloof/sanity-next/components/infinite-scroll-base";

<InfiniteScrollBase
  client={client}
  query={POSTS_QUERY}
  initialData={initialData}
  params={({ previousPageData }, { paginationParams }) => {
    if (previousPageData?.entries?.length < pageSize) return null;
    return {
      ...paginationParams({ pageSize }),
      filterTag: tagParam ?? null,
    };
  }}
  select={(pages, { mergePages }) => mergePages(pages)}
  hasMore={(pages) => {
    const allEntries = pages.flatMap((p) => p?.entries ?? []);
    const lastPage = pages[pages.length - 1];
    return allEntries.length < (lastPage?.entriesCount ?? 0);
  }}
>
  {({ data, hasMore, ref }) => (
    // ...
  )}
</InfiniteScrollBase>
```

#### Render Props

| Property       | Type                  | Description                                    |
| -------------- | --------------------- | ---------------------------------------------- |
| `data`         | `T \| undefined`      | The merged/selected data from all loaded pages |
| `isLoading`    | `boolean`             | Whether the first page is loading              |
| `isValidating` | `boolean`             | Whether any page is currently being fetched    |
| `hasMore`      | `boolean`             | Whether there are more pages to load           |
| `loadMore`     | `() => void`          | Function to manually trigger loading more      |
| `ref`          | `Ref<HTMLDivElement>` | Ref to attach to trigger element               |
| `inView`       | `boolean`             | Whether the trigger element is in view         |

## Hooks

### useInfiniteQuery

A powerful hook for infinite loading of Sanity data using SWR. Types are automatically inferred from the query when using Sanity's typegen.

```tsx
"use client";

import { useInfiniteQuery } from "@tinloof/sanity-next/hooks";
import { client } from "@/lib/sanity";

const BLOG_QUERY = `{
  "entries": *[_type == "post"] | order(publishedAt desc) [$pageStart...$pageEnd] {
    _id,
    title
  },
  "entriesCount": count(*[_type == "post"])
}`;

export function BlogIndex({ initialData }) {
  const pageSize = 10;

  const { data, loadMore, hasMore, isValidating } = useInfiniteQuery({
    client,
    query: BLOG_QUERY,
    initialData,
    params: ({ pageIndex, previousPageData }, { paginationParams }) => {
      // Stop pagination when previous page has fewer entries than page size
      if (previousPageData?.entries && previousPageData.entries.length < pageSize) {
        return null;
      }
      return paginationParams({ pageSize });
    },
    select: (pages, { mergePages }) => mergePages(pages),
  });

  return (
    <div>
      {data?.entries?.map((post) => (
        <article key={post._id}>{post.title}</article>
      ))}
      {hasMore && (
        <button onClick={loadMore} disabled={isValidating}>
          {isValidating ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

#### Props

| Prop          | Type                                 | Description                                      |
| ------------- | ------------------------------------ | ------------------------------------------------ |
| `client`      | `SanityClient`                       | The Sanity client instance                       |
| `query`       | `string`                             | The GROQ query to execute                        |
| `initialData` | `T` (optional)                       | Initial data for SSR hydration (first page)      |
| `params`      | `(state, helpers) => params \| null` | Function to get params for each page             |
| `select`      | `(pages, helpers) => T`              | Function to transform/merge pages                |
| `hasMore`     | `(pages) => boolean` (optional)      | Custom callback to determine if more pages exist |
| `swrOptions`  | `SWRInfiniteConfiguration` (optional)| SWR configuration options                        |

#### Params Function

The `params` function receives:

- `state.pageIndex`: Current page index (0-based)
- `state.previousPageData`: Data from the previous page, or null for the first page
- `helpers.paginationParams({ pageSize })`: Helper that generates `pageStart`, `pageEnd`, `pageNumber`, and `entriesPerPage`

Return `null` to stop fetching more pages.

#### Select Function

The `select` function receives:

- `pages`: Array of all fetched pages
- `helpers.mergePages(pages, config?)`: Helper that merges pages by concatenating entries arrays

#### Returns

| Property       | Type                  | Description                            |
| -------------- | --------------------- | -------------------------------------- |
| `data`         | `T \| undefined`      | The selected/merged data               |
| `pages`        | `T[]`                 | Raw array of all fetched pages         |
| `isLoading`    | `boolean`             | Whether the first page is loading      |
| `isValidating` | `boolean`             | Whether any page is being fetched      |
| `hasMore`      | `boolean`             | Whether there are more pages to load   |
| `loadMore`     | `() => void`          | Function to load the next page         |
| `size`         | `number`              | Number of pages currently loaded       |
| `setSize`      | `(size) => void`      | Function to set the number of pages    |

#### Example: Manual Pagination (without helpers)

```tsx
const { data, loadMore } = useInfiniteQuery({
  client,
  query: `*[_type == "post"] | order(publishedAt desc) [$pageStart...$pageEnd] { _id, title }`,
  params: ({ pageIndex }) => ({
    pageStart: pageIndex * 10,
    pageEnd: pageIndex * 10 + 10,
  }),
  select: (pages) => {
    const validPages = pages.filter(Boolean);
    return validPages.flat();
  },
});
```

#### Example: Custom hasMore Logic

```tsx
const { data, hasMore } = useInfiniteQuery({
  client,
  query: POSTS_QUERY,
  params: ({ pageIndex }, { paginationParams }) => paginationParams({ pageSize: 12 }),
  select: (pages, { mergePages }) => mergePages(pages, { entriesKey: "posts" }),
  hasMore: (pages) => {
    const allPosts = pages.flatMap((p) => p?.posts ?? []);
    const lastPage = pages[pages.length - 1];
    return allPosts.length < (lastPage?.totalPosts ?? 0);
  },
});
```

### useInView

A lightweight React hook wrapper around the Intersection Observer API. Detects when an element enters the viewport.

```tsx
"use client";

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

## Utils

### Metadata Resolution

Generate comprehensive Next.js metadata from Sanity content, including SEO tags, Open Graph images, and internationalization support.

```tsx
// app/[slug]/page.tsx
import { resolveSanityMetadata } from "@/lib/sanity";
import { loadPage } from "@/lib/sanity/queries";
import type { ResolvedMetadata } from "next";

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

#### Props

| Prop           | Type                        | Description                               |
| -------------- | --------------------------- | ----------------------------------------- |
| `parent`       | `ResolvedMetadata`          | Parent metadata from Next.js              |
| `title`        | `string` (optional)         | Page title                                |
| `seo`          | `object` (optional)         | SEO configuration object                  |
| `pathname`     | `string\|object` (optional) | Page pathname or slug object              |
| `locale`       | `string` (optional)         | Current locale                            |
| `translations` | `array` (optional)          | Array of translation objects for hreflang |

### Redirects

Handle dynamic redirects managed through Sanity CMS:

```tsx
// middleware.ts
import { NextRequest } from "next/server";
import { redirectIfNeeded } from "@/lib/sanity";

export async function middleware(request: NextRequest) {
  return await redirectIfNeeded({ request });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

### Sitemap Generation

Generate XML sitemaps from your Sanity content. The sitemap utilities automatically find all documents that have a `pathname.current` field and are marked as indexable (`seo.indexable`).

#### Single Language

```tsx
// app/sitemap.ts
import { generateSitemap } from "@/lib/sanity";

export default function Sitemap() {
  return generateSitemap();
}
```

#### Multi-language

When you initialize with i18n config, the `generateSitemap` function automatically handles multiple languages and alternates:

```tsx
// app/sitemap.ts
import { generateSitemap } from "@/lib/sanity";

export default function Sitemap() {
  return generateSitemap();
}
```

## Server Actions

### disableDraftMode

A pre-built server action for disabling Sanity's draft mode:

```tsx
// app/layout.tsx
import { disableDraftMode } from "@tinloof/sanity-next/actions/disable-draft-mode";
import { ExitPreview } from "@tinloof/sanity-next/components/exit-preview";

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

## Advanced Configuration

### Custom Client Configuration

```tsx
import { initSanity } from "@tinloof/sanity-next";

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
import { initSanity } from "@tinloof/sanity-next";

export const sanity = initSanity({
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://production-site.com",
});
```

### Using a Custom Viewer Token

```tsx
import { initSanity } from "@tinloof/sanity-next";

export const sanity = initSanity({
  viewerToken: process.env.MY_CUSTOM_VIEWER_TOKEN,
});
```

## Types

### PageProps

A helper type for Next.js page components with typed params and search params:

```tsx
import type { PageProps } from "@tinloof/sanity-next";

export default async function Page({
  params,
  searchParams,
}: PageProps<"slug" | "locale", "page" | "sort">) {
  const { slug, locale } = await params;
  const { page, sort } = await searchParams;

  // slug: string, locale: string
  // page: string | string[] | undefined
  // sort: string | string[] | undefined
}
```

For catch-all routes:

```tsx
import type { PageProps } from "@tinloof/sanity-next";

export default async function Page({
  params,
}: PageProps<"...path">) {
  const { path } = await params;
  // path: string[]
}
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