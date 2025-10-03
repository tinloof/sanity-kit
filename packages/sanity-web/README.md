# @tinloof/sanity-web

A collection of Sanity-related utilities for web development.

## Table of Contents

- [Installation](#installation)
- [Components](#components)
  - [ExitPreview](#exitpreview)
    - [Usage](#usage)
    - [Props](#props)
    - [Features](#features)
    - [Styling](#styling)
    - [Dependencies](#dependencies)
- [Utils](#utils)
  - [Redirects](#redirects)
    - [getRedirect](#getredirect)
    - [getPathVariations](#getpathvariations)
    - [REDIRECT_QUERY](#redirect_query)
    - [Schema Setup](#schema-setup)
  - [Sitemap](#sitemap)
    - [generateSanitySitemap](#generatesanitysitemap)
    - [generateSanityI18nSitemap](#generatesanityi18nsitemap)
- [Fragments](#fragments)
  - [TRANSLATIONS_FRAGMENT](#translations_fragment)
- [License](#license)
- [Develop & test](#develop--test)

## Installation

```sh
npm install @tinloof/sanity-web
```

## Components

### ExitPreview

A React component that provides a UI for exiting Sanity's draft mode/preview mode. The component renders a fixed-position button that allows users to disable draft mode and refresh the page.

#### Usage

```tsx
import ExitPreviewClient from "./components/exit-preview-client";
import {disableDraftMode} from "./actions";

// In your app/layout.tsx or similar
export default function RootLayout({children}) {
  return (
    <html>
      <body>
        {children}
        <ExitPreviewClient disableDraftMode={disableDraftMode} />
      </body>
    </html>
  );
}
```

Create a client component wrapper in `app/components/exit-preview-client.tsx`:

```tsx
"use client";

import {ExitPreview, ExitPreviewProps} from "@tinloof/sanity-web";

export default function ExitPreviewClient(props: ExitPreviewProps) {
  return <ExitPreview {...props} />;
}
```

Create the server action in `app/actions.ts`:

```tsx
"use server";

import {draftMode} from "next/headers";

export async function disableDraftMode() {
  "use server";
  await Promise.allSettled([
    (await draftMode()).disable(),
    // Simulate a delay to show the loading state
    new Promise((resolve) => setTimeout(resolve, 1000)),
  ]);
}
```

#### Props

| Prop               | Type                             | Description                                                                                              |
| ------------------ | -------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `disableDraftMode` | `() => Promise<void>`            | A function that disables draft mode. This should handle clearing preview cookies and revalidating paths. |
| `className`        | `string` (optional)              | CSS class name to apply to the button. When provided, default styles are not applied.                    |
| `styles`           | `React.CSSProperties` (optional) | Additional inline styles to merge with default styles. Only applied when `className` is not provided.    |

#### Features

- **Conditional rendering**: Only shows when not in Sanity's Presentation Tool
- **Loading state**: Shows "Disabling..." text while the draft mode is being disabled
- **Auto-refresh**: Automatically refreshes the page after disabling draft mode
- **Fixed positioning**: Positioned at the bottom center of the screen with high z-index
- **Accessible**: Properly disabled during loading state

#### Styling

The component provides flexible styling options:

**Default styling**: When no `className` is provided, the component uses inline styles for a black button with white text, positioned fixed at the bottom center of the screen.

**Custom styles with `styles` prop**: You can merge additional styles with the defaults:

```tsx
<ExitPreview
  disableDraftMode={disableDraftMode}
  styles={{backgroundColor: "blue", borderRadius: "8px"}}
/>
```

**Custom styling with `className` prop**: For complete control, provide a `className`. This disables all default styles:

```tsx
<ExitPreview
  disableDraftMode={disableDraftMode}
  className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white rounded-md py-2 px-4"
/>
```

#### Dependencies

- Requires `next-sanity/hooks` for `useIsPresentationTool`
- Requires `next/navigation` for `useRouter`
- Built for Next.js App Router with React 18+ (uses `useTransition`)

## Utils

### Redirects

Utilities for handling URL redirects managed through Sanity CMS. These functions help you implement dynamic redirects that can be managed by content editors without code changes.

#### getRedirect

Fetches redirect configuration from Sanity for a given source path. This function automatically generates path variations to handle different URL formats and queries Sanity to find matching redirect rules.

```tsx
import {getRedirect} from "@tinloof/sanity-web";
import {sanityFetch} from "@/data/sanity/client";

// In Next.js middleware
export async function middleware(request: NextRequest) {
  const redirect = await getRedirect({
    source: request.nextUrl.pathname,
    sanityFetch,
  });

  if (redirect) {
    return NextResponse.redirect(new URL(redirect.destination, request.url), {
      status: redirect.permanent ? 301 : 302,
    });
  }
}
```

**Props:**

| Prop          | Type                     | Description                                    |
| ------------- | ------------------------ | ---------------------------------------------- |
| `source`      | `string`                 | The source path to look up (e.g., "/old-page") |
| `sanityFetch` | `DefinedSanityFetchType` | Sanity fetch function from next-sanity         |
| `query`       | `string` (optional)      | Custom GROQ query (defaults to REDIRECT_QUERY) |

**Returns:** Promise that resolves to redirect data or null if no redirect found.

**Redirect Data:**

| Property      | Type      | Description                                                   |
| ------------- | --------- | ------------------------------------------------------------- |
| `source`      | `string`  | The source path that triggers the redirect                    |
| `destination` | `string`  | The destination URL to redirect to                            |
| `permanent`   | `boolean` | Whether this is a permanent (301) or temporary (302) redirect |

#### getPathVariations

Generates path variations for flexible redirect matching. This function creates multiple variations of a path to handle different URL formats that users might access.

```tsx
import {getPathVariations} from "@tinloof/sanity-web";

getPathVariations("/about-us/");
// Returns: ["about-us", "/about-us/", "about-us/", "/about-us"]

getPathVariations("contact");
// Returns: ["contact", "/contact/", "contact/", "/contact"]
```

**Props:**

| Prop   | Type     | Description                               |
| ------ | -------- | ----------------------------------------- |
| `path` | `string` | The input path to generate variations for |

**Returns:** Array of path variations to match against redirect rules.

#### REDIRECT_QUERY

A GROQ query constant for fetching redirect configuration from Sanity settings.

```groq
*[_type == "settings"][0].redirects[@.source in $paths][0]
```

#### Schema Setup

For the best experience, use the `redirectsSchema` from `@tinloof/sanity-studio` which provides a searchable interface and validation for managing redirects. See the [redirectsSchema documentation](../../packages/sanity-studio/README.md#redirectsschema) for setup instructions.

```tsx
import {redirectsSchema} from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "settings",
  fields: [
    redirectsSchema,
    // ... other fields
  ],
});
```

### Sitemap

Utilities for generating sitemaps from Sanity content for Next.js applications. These functions help create dynamic sitemaps that include all indexable pages from your Sanity CMS.

#### generateSanitySitemap

Generates a sitemap for single-language Next.js applications using Sanity content.

```tsx
import {generateSanitySitemap} from "@tinloof/sanity-web";

import {sanityFetch} from "@/data/sanity/live";

export default function Sitemap() {
  return generateSanitySitemap({
    sanityFetch,
    websiteBaseURL: "https://tinloof.com",
  });
}
```

**Props:**

| Prop             | Type                     | Description                            |
| ---------------- | ------------------------ | -------------------------------------- |
| `websiteBaseURL` | `string`                 | The base URL of your website           |
| `sanityFetch`    | `DefinedSanityFetchType` | Sanity fetch function from next-sanity |

**Returns:** Array of sitemap entries with `url` and `lastModified` properties.

#### generateSanityI18nSitemap

Generates a sitemap for multi-language Next.js applications using Sanity content with internationalization support.

```tsx
import {generateSanityI18nSitemap} from "@tinloof/sanity-web";

import {sanityFetch} from "@/data/sanity/live";

const i18n = {
  defaultLocaleId: "en",
  locales: [
    {id: "en", title: "English"},
    {id: "fr", title: "Français"},
  ],
};

export default function Sitemap() {
  return generateSanityI18nSitemap({
    sanityFetch,
    websiteBaseURL: "https://tinloof.com",
    i18n,
  });
}
```

**Props:**

| Prop             | Type                     | Description                               |
| ---------------- | ------------------------ | ----------------------------------------- |
| `websiteBaseURL` | `string`                 | The base URL of your website              |
| `sanityFetch`    | `DefinedSanityFetchType` | Sanity fetch function from next-sanity    |
| `i18n`           | `i18nConfig`             | Internationalization configuration object |

**Returns:** Array of sitemap entries with `url`, `lastModified`, and `alternates.languages` properties for multi-language support.

**Requirements:**

- Documents must have a boolean field called `indexable` set to `true` to be included in the sitemap
- Documents must have a slug field called `pathname` (typically `pathname.current`) containing the URL path, or be of type "home"
- For i18n sitemaps, documents must have a `locale` field
- Translation metadata must be properly configured for alternate language URLs
- The sitemap functions should be used in a `sitemap.ts` file in your Next.js app directory

## Fragments

### TRANSLATIONS_FRAGMENT

A GROQ fragment that fetches translation metadata for a document. This fragment retrieves all translations associated with a document through the translation metadata system.

```groq
"translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
  "pathname": pathname.current,
  locale
}
```

#### Usage examples

Here are some common usage patterns for the `TRANSLATIONS_FRAGMENT`:

**Modular page query:**

```tsx
import {TRANSLATIONS_FRAGMENT} from "@tinloof/sanity-web";

export const MODULAR_PAGE_QUERY = defineQuery(`
  *[_type == "modular.page" && pathname.current == $pathname && locale == $locale][0] {
    ...,
    sections[] ${SECTIONS_BODY_FRAGMENT},
    ${TRANSLATIONS_FRAGMENT},
  }`);
```

**Sitemap query:**

```tsx
import {TRANSLATIONS_FRAGMENT} from "@tinloof/sanity-web";

export const SITEMAP_QUERY = defineQuery(`
  *[((pathname.current != null || _type == "home") && indexable && locale == $defaultLocale)] {
    pathname,
    "lastModified": _updatedAt,
    locale,
    _type,
    "translations": *[_type == "translation.metadata" && references(^._id)].translations[].value->{
      "pathname": pathname.current,
      locale
    },
  }`);
```

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
