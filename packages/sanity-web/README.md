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
  - [SectionsRenderer](#sectionsrenderer)
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

### SectionsRenderer

A React component that dynamically renders sections based on their `_type` field. This component is designed to work with Sanity's modular content approach, where pages contain arrays of section objects that need to be rendered with different components.

#### Usage

```tsx
import {SectionsRenderer} from "@tinloof/sanity-web";
import HeroSection from "./sections/hero-section";
import CallToAction from "./sections/call-to-action";

// Basic usage
export default function Page({sections}) {
  return (
    <SectionsRenderer
      data={sections}
      components={{
        "section.hero": HeroSection,
        "section.cta": CallToAction,
      }}
    />
  );
}
```

#### Props

| Prop                | Type                                                             | Description                                                  |
| ------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------ |
| `data`              | `TSections` (optional)                                           | Array of section data objects to render                      |
| `components`        | `SectionComponentMap<TSections, TSharedProps>`                   | Map of section type strings to their React components        |
| `sharedProps`       | `TSharedProps` (optional)                                        | Props shared across all section components                   |
| `className`         | `string` (optional)                                              | Optional container class name                                |
| `fallbackComponent` | `(props: {type: string, availableTypes: string[]}) => ReactNode` | Custom fallback component callback for missing section types |
| `showDevWarnings`   | `boolean` (optional, default: true in development)               | Show dev warnings for missing components                     |

#### Features

**Dynamic Section Rendering**: Automatically maps section `_type` fields to React components, making it easy to build modular page layouts.

**Enhanced Component Props**: Each section component receives:

- All original section data as props
- `_sectionIndex`: The index of the section in the array
- `_sections`: Reference to the complete sections array
- `rootHtmlAttributes`: Object with `data-section` attribute and deep-link `id` (based on the section's `_key`)

**Deep Link Support**: Automatically generates unique IDs for each section using the section's `_key`, enabling smooth anchor navigation.

**Development-Friendly**:

- Shows helpful warnings when section components are missing
- Displays a fallback component with available section types
- Validates section data structure

**Custom Fallback Components**: Provide a callback function that receives the missing section type and available types:

```tsx
<SectionsRenderer
  data={sections}
  components={componentMap}
  fallbackComponent={({type, availableTypes}) => (
    <div className="p-4 bg-yellow-100 border border-yellow-400 rounded">
      <h3>Missing Component: {type}</h3>
      <p>Available: {availableTypes.join(", ")}</p>
    </div>
  )}
/>
```

**Section Component Structure**: Your section components will receive enhanced props:

```tsx
type SectionComponentProps = {
  // Your section data fields
  title?: string;
  content?: any;
  // Enhanced props from SectionsRenderer
  _key: string;
  _type: string;
  _sectionIndex: number;
  _sections: SectionData[];
  rootHtmlAttributes: {
    "data-section": string;
    id: string;
  };
};

export default function HeroSection({
  title,
  content,
  _sectionIndex,
}: SectionComponentProps) {
  return (
    <section>
      <h1>{title}</h1>
      <div>{content}</div>
    </section>
  );
}
```

#### Factory Function

Create reusable, pre-configured, type-safe renderers with `createSectionsComponent`:

```tsx
// components/sections/index.ts
import {createSectionsComponent} from "@tinloof/sanity-web/components";
import type {PAGE_QUERYResult} from "@/sanity/types";
import HeroSection from "./hero-section";
import CallToAction from "./call-to-action";
import TextSection from "./text-section";

// Create the sections renderer
const Sections = createSectionsComponent<
  NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>
>({
  components: {
    "section.hero": HeroSection,
    "section.cta": CallToAction,
    "section.text": TextSection,
  },
  className: "space-y-16",
  showDevWarnings: true,
  fallbackComponent: ({type}) => <div>Custom fallback for: {type}</div>,
});

// Infer SectionProps directly from the Sections component
type SectionProps = (typeof Sections)["_SectionProps"];

export {Sections, type SectionProps};
```

Use throughout your app with minimal props:

```tsx
// pages/[slug].tsx
import {Sections} from "@/components/sections";

export default function Page({sections}) {
  return <Sections data={sections} />;
}
```

#### Shared Props

Pass props that are shared across all section components using `sharedProps`:

```tsx
// components/sections/index.ts
import {createSectionsComponent} from "@tinloof/sanity-web/components";
import type {PAGE_QUERYResult} from "@/sanity/types";
import HeroSection from "./hero-section";
import CallToAction from "./call-to-action";

// Create renderer with shared props type
const Sections = createSectionsComponent<
  NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>,
  {locale: string; isPreview: boolean}
>({
  components: {
    "section.hero": HeroSection,
    "section.cta": CallToAction,
  },
});

// Infer SectionProps directly from the Sections component
type SectionProps = (typeof Sections)["_SectionProps"];

export {Sections, type SectionProps};
```

Usage - `sharedProps` is required when shared props type is defined:

```tsx
// pages/[slug].tsx
import {Sections} from "@/components/sections";

export default function Page({sections, locale}) {
  return (
    <Sections
      data={sections}
      sharedProps={{locale, isPreview: false}}
    />
  );
}
```

Section components receive shared props along with their section data:

```tsx
// components/sections/hero-section.tsx
import type {SectionProps} from ".";

export default function HeroSection({
  title,
  locale,      // From sharedProps
  isPreview,   // From sharedProps
}: SectionProps["section.hero"]) {
  return (
    <section>
      <h1>{title}</h1>
      <p>Locale: {locale}</p>
    </section>
  );
}
```

#### TypeScript Support

The component provides full TypeScript support with automatic type inference from your Sanity schema. The `_SectionProps` property on the created renderer gives you access to fully typed props for each section:

```tsx
// components/sections/index.ts
import {createSectionsComponent} from "@tinloof/sanity-web/components";
import type {PAGE_QUERYResult} from "@/sanity/types";
import HeroSection from "./hero-section";
import CallToAction from "./call-to-action";

// Create the sections renderer
const Sections = createSectionsComponent<
  NonNullable<NonNullable<PAGE_QUERYResult>["sections"]>
>({
  components: {
    "section.hero": HeroSection,
    "section.cta": CallToAction,
  },
});

// Infer SectionProps from the Sections component using _SectionProps
type SectionProps = (typeof Sections)["_SectionProps"];

export {Sections, type SectionProps};
```

Section components import `SectionProps` and access their specific type using bracket notation:

```tsx
// components/sections/hero-section.tsx
import type {SectionProps} from ".";

// Props are fully typed based on your Sanity schema
export default function HeroSection({
  title,
  subtitle,
  _sectionIndex,
  _key,
  rootHtmlAttributes,
}: SectionProps["section.hero"]) {
  return (
    <section {...rootHtmlAttributes}>
      <h1>{title}</h1>
      {subtitle && <h2>{subtitle}</h2>}
    </section>
  );
}
```

The `SectionProps` type is a mapped type where each key is a section `_type` (e.g., `"section.hero"`, `"section.cta"`) and the value is the fully typed props for that section, including:

- All fields from your Sanity schema for that section type
- `_key`: Unique key for the section
- `_sectionIndex`: Index of the section in the array
- `_sections`: The full sections array
- `rootHtmlAttributes`: Object with `data-section` and `id` for deep linking
- Any shared props defined in the second generic parameter

## Utils

### Metadata Resolution

Utilities for generating Next.js metadata from Sanity CMS content. These functions help create comprehensive metadata including SEO tags, Open Graph images, canonical URLs, and internationalization support.

#### createSanityMetadataResolver

Creates a configured metadata resolver function that can be reused across multiple pages.

```typescript
import {createSanityMetadataResolver} from "@tinloof/sanity-web";
import {client} from "./sanity/client";

// Create a configured metadata resolver
export const resolveSanityMetadata = createSanityMetadataResolver({
  client,
  websiteBaseURL: "https://example.com",
  defaultLocaleId: "en",
});
```

#### Usage in Next.js Pages

Use the metadata resolver in your page or layout components:

```typescript
import {resolveSanityMetadata} from "@/lib/sanity/metadata";
import {loadHome} from "@/data/sanity";
import {notFound} from "next/navigation";

type IndexRouteProps = {
  params: Promise<{locale: string}>;
};

export async function generateMetadata(
  props: IndexRouteProps,
  parentPromise: ResolvingMetadata,
) {
  const parent = await parentPromise;
  const locale = (await props.params).locale;

  const initialData = await loadHome({locale});

  if (!initialData) return notFound();

  return resolveSanityMetadata({...initialData, parent});
}
```

**Props for resolveSanityMetadata:**

| Prop           | Type                        | Description                                       |
| -------------- | --------------------------- | ------------------------------------------------- |
| `parent`       | `ResolvedMetadata`          | Parent metadata from Next.js                      |
| `title`        | `string` (optional)         | Page title                                        |
| `seo`          | `object` (optional)         | SEO configuration with title, description, images |
| `pathname`     | `string\|object` (optional) | Page pathname (string or slug object)             |
| `locale`       | `string` (optional)         | Current locale                                    |
| `translations` | `array` (optional)          | Array of translation objects                      |
| `indexable`    | `boolean` (optional)        | Whether page should be indexed by search engines  |

**SEO Object Structure:**

```typescript
type Seo = {
  title?: string;
  description?: string;
  image?: Image; // Sanity image asset
};
```

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

| Property      | Type      | Description                                       |
| ------------- | --------- | ------------------------------------------------- |
| `source`      | `string`  | The source path that triggers the redirect        |
| `destination` | `string`  | The destination URL to redirect to                |
| `permanent`   | `boolean` | Whether this is a permanent or temporary redirect |

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
  *[((pathname.current != null || _type == "home") && seo.indexable && locale == $defaultLocale)] {
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
