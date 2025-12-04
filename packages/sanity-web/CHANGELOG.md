# @tinloof/sanity-web

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
  type SharedProps = {locale: string};

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
    sharedProps={{locale: "en"}}
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
