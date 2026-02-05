# @tinloof/sanity-web

## 2.0.1

### Patch Changes

- 2d358f3:

## 2.0.0

### Major Changes

- abca273: **BREAKING CHANGE**: Updated peer dependencies to require Sanity v5, React 19.2.3+, Next.js 16.0.10+, and next-sanity v12.

  These minimum versions are required due to:
  - Sanity v5 dropping support for React < 19.2
  - next-sanity v12 requiring Next.js 16 and React 19.2
  - Critical security vulnerabilities (CVE-2025-55182, CVE-2025-67779) in earlier versions of React and Next.js

## 1.1.1

### Patch Changes

- c0fce45: Add @types/node

## 1.1.0

### Minor Changes

- 947c643: Add portable text utilities and type-safe components

  ## New Components
  - `PortableText`: Type-safe wrapper around `@portabletext/react` with automatic heading slug generation and enhanced TypeScript inference from Sanity typegen
    - Automatically generates slugs for h1-h6 headings for anchor links
    - Infers available blocks, marks, lists, and custom types from your Sanity schema
    - Full autocomplete support for component definitions

  ## New Utilities

  ### Portable Text Type Helpers
  - `ExtractPtBlockType`: Type utility to extract all custom block type names from a PortableText array (excludes standard "block" type)
  - `ExtractPtBlock`: Type utility to extract the full type definition of a specific custom block for component props
  - `getPtComponentId`: Runtime utility to generate unique slugs for portable text blocks based on their content

  These utilities provide full type safety when building custom portable text components, with autocomplete for all your custom block types.

  ## New Exports
  - `@tinloof/sanity-web/hooks`: Export hooks module for future web-specific hooks

  ## Dependencies
  - Add `next-sanity` as peer dependency (^9 || ^10 || ^11)
  - Add `@types/speakingurl` as dev dependency for slug generation types

  ## Example Usage

  ```tsx
  import { PortableText } from "@tinloof/sanity-web/components/portable-text";
  import type { ExtractPtBlock } from "@tinloof/sanity-web/utils";
  import type { BLOG_POST_QUERYResult } from "./sanity.types";

  type PTBody = NonNullable<BLOG_POST_QUERYResult>["ptBody"];

  type PTBodyBlock<TType extends ExtractPtBlockType<PTBody>> = ExtractPtBlock<
    PTBody,
    TType
  >;

  function ImageComponent(props: PTBodyBlock<"imagePtBlock">) {
    return <img src={props.asset?._ref} alt={props.alt} />;
  }

  <PortableText<PTBody>
    value={data.ptBody}
    components={{
      types: {
        imagePtBlock: ImageComponent,
      },
    }}
  />;
  ```

### Patch Changes

- cc1b86d:

## 1.0.0

### Major Changes

- 739eb24: BREAKING CHANGES: Removed Next.js-specific utilities that have been moved to @tinloof/sanity-next

  The following exports have been completely removed from @tinloof/sanity-web:

  **Components:**
  - `ExitPreview` component

  **Middleware:**
  - `redirectIfNeeded` function
  - All `/middleware/*` exports removed

  **Server utilities:**
  - `generateSanitySitemap`
  - `generateSanityI18nSitemap`
  - All `/server/*` exports removed

  **Utils:**
  - `getRedirect` function
  - `resolveSanityRouteMetadata` function
  - `createSanityMetadataResolver` function
  - `getOgImages` function

  **Queries:**
  - `REDIRECT_QUERY`
  - `SITEMAP_QUERY`
  - `I18N_SITEMAP_QUERY`

  **Peer dependencies removed:**
  - `next` - no longer required
  - `next-sanity` - no longer required

  **Migration:** Install `@tinloof/sanity-next` and update your imports to use the new package locations.

## 0.13.0

### Minor Changes

- 8fc83a4: Add `_SectionProps` to `createSections` for simplified type inference
  - The component returned by `createSections` now exposes a `_SectionProps` property that provides fully typed props for each section type
  - This eliminates the need for manually constructing `SectionProps` types with generics
  - Section components can now use simple bracket notation: `SectionProps["section.hero"]` instead of `SectionProps<"section.hero">`
  - Internal type handling updated to avoid circular dependencies when section components import `SectionProps` from the same file that creates the renderer

  Example usage:

  ```tsx
  const Sections = createSections<
    NonNullable<PAGE_QUERYResult["sections"]>,
    { locale: string }
  >({
    components: {
      "section.hero": HeroSection,
      "section.text": TextSection,
    },
  });

  // Infer SectionProps directly from the Sections component
  type SectionProps = (typeof Sections)["_SectionProps"];

  export { Sections, type SectionProps };

  // In section components:
  export default function HeroSection(props: SectionProps["section.hero"]) {
    // fully typed props
  }
  ```

- 739a759: Add type-safe generics and sharedProps support to createSections
  - `createSections` now accepts two generic type parameters:
    - `TSections`: The sections array type from your Sanity query result
    - `TSharedProps`: Optional type for props shared across all section components
  - Renamed `sectionComponentMap` to `components` for a cleaner API
  - Added `sharedProps` option to pass props that are spread to all section components
  - Section components now receive full type inference based on their `_type`
  - Exported new `SectionProps` utility type for typing section components

  Example usage:

  ```tsx
  type Sections = NonNullable<PAGE_QUERYResult>["sections"];
  type SharedProps = { locale: string };

  export const SectionsRenderer = createSections<Sections, SharedProps>({
    components: {
      "section.hero": HeroSection,
      "section.text": TextSection,
    },
  });

  // In your page
  <SectionsRenderer data={page.sections} sharedProps={{ locale: "en" }} />;
  ```

## 0.12.1

### Patch Changes

- 0fb1b20: Update dependencies to latest versions
  - Update Sanity packages to latest stable versions
  - Update Next.js and React dependencies
  - Update TypeScript and build tooling dependencies
  - Fix component type definitions for improved TypeScript compatibility
  - Remove deprecated eslint configuration

## 0.12.0

### Minor Changes

- 739a759: Add type-safe generics and sharedProps support to createSectionsRenderer
  - `createSectionsRenderer` now accepts two generic type parameters:
    - `TSections`: The sections array type from your Sanity query result
    - `TSharedProps`: Optional type for props shared across all section components
  - Renamed `sectionComponentMap` to `components` for a cleaner API
  - Added `sharedProps` option to pass props that are spread to all section components
  - Section components now receive full type inference based on their `_type`
  - Exported new `SectionProps` utility type for typing section components

  Example usage:

  ```tsx
  type Sections = NonNullable<PAGE_QUERYResult>["sections"];
  type SharedProps = { locale: string };

  export const SectionsRenderer = createSectionsRenderer<Sections, SharedProps>(
    {
      components: {
        "section.hero": HeroSection,
        "section.text": TextSection,
      },
    },
  );

  // In your page
  <SectionsRenderer
    sectionsData={page.sections}
    sharedProps={{ locale: "en" }}
  />;
  ```

## 0.11.0

### Minor Changes

- d3f0d97: Add SectionsRenderer component for dynamic section rendering

  Introduces a new `SectionsRenderer` component that dynamically renders sections based on their `_type` field. This component is designed for Sanity's modular content approach where pages contain arrays of section objects.

  Key features:
  - Dynamic section-to-component mapping via `sectionComponentMap`
  - Enhanced props for each section component including `_sectionIndex`, `_sections`, and `rootHtmlAttributes`
  - Deep link support with automatic ID generation
  - Custom fallback component callback for missing section types (breaking change: now accepts a function instead of ReactNode)
  - Development warnings for missing components
  - Factory function `createSectionsRenderer` for pre-configured instances

## 0.10.0

### Minor Changes

- 58492bd: Add `createSanityMetadataResolver` utility for generating Next.js metadata from Sanity CMS content

  This new utility provides a comprehensive solution for generating Next.js metadata including SEO tags, Open Graph images, canonical URLs, and internationalization support. The factory function creates a reusable metadata resolver that can be configured once and used across multiple pages.

  Key features:
  - **Factory pattern**: Configure once with client, websiteBaseURL, and defaultLocaleId
  - **SEO optimization**: Generates title, description, and Open Graph metadata
  - **Image handling**: Automatic Open Graph image generation from Sanity image assets
  - **Internationalization**: Support for multi-language sites with canonical URLs and alternate language links
  - **Indexing control**: Respects indexable field for search engine visibility

  The resolver handles pathname localization, canonical URL generation, and provides fallback logic for Open Graph images from parent metadata when SEO images aren't available.

- 6e1f75f: Update SEO indexable field path

## 0.9.0

### Minor Changes

- 1105a25: Sitemap utility
- 13921cd: Translations fragment
- 6f18d6c: ExitPreview component
- b1b4195: getRedirects util
- 3c7a78f: Structure and exports revamped

## 0.8.1

### Patch Changes

- f826214: Disable default lqip

## 0.8.0

### Minor Changes

- 4b7f06a: use `sanity/presentation` instead of `@sanity/presentation`

## 0.7.0

### Minor Changes

- 164b8db: Support React 19

## 0.6.0

### Minor Changes

- 1f6a3b8: Support Next 15 and React 19

### Patch Changes

- 85e2320: Improve sections

## 0.5.0

### Minor Changes

- f07b1c6: Expose fetchPriority from SanityImage to preload images

## 0.4.3

### Patch Changes

- 89b54ad: Updated dependency `@sanity/document-internationalization` to `^3.0.1`.
  Updated dependency `@sanity/presentation` to `^1.16.5`.
  Updated dependency `@sanity/ui` to `^2.8.9`.
  Updated dependency `@sanity/util` to `^3.57.4`.
  Updated dependency `@tanstack/react-virtual` to `^3.10.8`.
  Updated dependency `use-debounce` to `^10.0.3`.
  Updated dependency `@types/lodash` to `^4.17.7`.
  Updated dependency `@types/react` to `^18.3.7`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.18.0`.
  Updated dependency `@typescript-eslint/parser` to `^7.18.0`.
  Updated dependency `eslint-plugin-prettier` to `^5.2.1`.
  Updated dependency `eslint-plugin-react` to `^7.36.1`.
  Updated dependency `prettier` to `^3.3.3`.
  Updated dependency `prettier-plugin-packagejson` to `^2.5.2`.
  Updated dependency `rimraf` to `^5.0.10`.
  Updated dependency `sanity` to `^3.57.4`.
  Updated dependency `styled-components` to `^6.1.13`.
  Updated dependency `typescript` to `^5.6.2`.
  Updated dependency `@changesets/cli` to `^2.27.8`.
  Updated dependency `tsup` to `^8.3.0`.

## 0.4.2

### Patch Changes

- 55dae45: Updated dependency `@sanity/presentation` to `^1.16.1`.
  Updated dependency `@sanity/ui` to `^2.6.1`.
  Updated dependency `@sanity/util` to `^3.48.1`.
  Updated dependency `@tanstack/react-virtual` to `^3.8.1`.
  Updated dependency `@types/lodash` to `^4.17.6`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.15.0`.
  Updated dependency `@typescript-eslint/parser` to `^7.15.0`.
  Updated dependency `eslint-plugin-react` to `^7.34.3`.
  Updated dependency `sanity` to `^3.48.1`.
  Updated dependency `typescript` to `^5.5.3`.
  Updated dependency `@changesets/cli` to `^2.27.7`.

## 0.4.1

### Patch Changes

- 9e62382: Updated dependency `@sanity/presentation` to `^1.16.0`.
  Updated dependency `@sanity/ui` to `^2.4.0`.
  Updated dependency `@sanity/util` to `^3.46.1`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.13.1`.
  Updated dependency `@typescript-eslint/parser` to `^7.13.1`.
  Updated dependency `npm-run-all2` to `^5.0.2`.
  Updated dependency `sanity` to `^3.46.1`.

## 0.4.0

### Minor Changes

- 29a848a: Add option to use a custom `localizePathname` function in the Pages plugin and in pathname fields. Thanks @marcusforsberg!

### Patch Changes

- 4c92cc8: Updated dependency `@sanity/presentation` to `^1.15.14`.
  Updated dependency `@sanity/ui` to `^2.3.3`.
  Updated dependency `@tanstack/react-virtual` to `^3.5.1`.
  Updated dependency `@types/lodash` to `^4.17.5`.
  Updated dependency `@types/react` to `^18.3.3`.
  Updated dependency `@types/react-is` to `^18.3.0`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.13.0`.
  Updated dependency `@typescript-eslint/parser` to `^7.13.0`.
  Updated dependency `eslint-plugin-react` to `^7.34.2`.
  Updated dependency `eslint-plugin-react-hooks` to `^4.6.2`.
  Updated dependency `npm-run-all2` to `^5.0.0`.
  Updated dependency `prettier` to `^3.3.2`.
  Updated dependency `react` to `^18.3.1`.
  Updated dependency `react-dom` to `^18.3.1`.
  Updated dependency `react-is` to `^18.3.1`.
  Updated dependency `rimraf` to `^5.0.7`.
  Updated dependency `sanity` to `^3.45.0`.
  Updated dependency `styled-components` to `^6.1.11`.
  Updated dependency `@changesets/cli` to `^2.27.5`.
  Updated dependency `@types/react-dom` to `^18.3.0`.
  Updated dependency `tsup` to `^8.1.0`.
  Updated dependency `@portabletext/react` to `^3.1.0`.

## 0.3.1

### Patch Changes

- 8575999: Add SanityImage jsdoc

## 0.3.0

### Minor Changes

- 0696902: Update `<SanityImage />` component to fix LQIP background issues with png images.
  Also add a `lqip` prop of type `boolean` (`true` by default) to `<SanityImage />` to enable/disable LQIP background image.

## 0.2.1

### Patch Changes

- 5fe8baf: Fix SanityImage types

## 0.2.0

### Minor Changes

- e48e6e5: Add `<SanityImage />` component.

  Add `isExternalUrl`, `pathToAbsUrl` and `getPtComponentId` utils.

  Update dependencies.

### Patch Changes

- ec602d8: Update dependencies

## 0.1.1

### Patch Changes

- a09953c: Update dependencies

## 0.1.0

### Minor Changes

- Initial version
