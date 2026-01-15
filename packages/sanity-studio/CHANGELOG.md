# @tinloof/sanity-plugin-pages-navigator

## 1.16.2

### Patch Changes

- 51c2917: Highlight decorator

## 1.16.1

### Patch Changes

- Updated dependencies [c0fce45]
  - @tinloof/sanity-web@1.1.1

## 1.16.0

### Minor Changes

- 947c643: Add portable text field factory for reusable content configurations

  ## New Utilities

  ### Portable Text Factory
  - `definePortableTextFactory`: A factory function that creates project-specific portable text field builders with predefined registries of styles, blocks, decorators, lists, annotations, and inner blocks

  This eliminates repetitive portable text configuration by defining your content blocks once and reusing them across schemas with type-safe key selection.

  **Key Features:**
  - Define content blocks once in a central registry
  - Reference blocks by key when creating fields
  - Full TypeScript support with autocomplete for registry keys
  - Automatic filtering of selected items from registry
  - Support for all portable text features: styles (h1-h6, blockquote), decorators (bold, italic, code), lists (bullet, number), blocks (images, code blocks), annotations (links), and inner blocks (inline elements)

  ### Default Registries

  Export pre-configured defaults for common portable text elements:
  - `defaultPTStyles`: Normal, H1-H6, and blockquote styles
  - `defaultPTLists`: Bullet and numbered list types
  - `defaultPTDecorators`: Strong, emphasis, underline, strike-through, and code decorators

  ### Additional Utilities
  - `isUnique`: Validation helper for ensuring field uniqueness across documents

  ## Example Usage

  ```ts
  // Define your registry once
  export const createPtBody = definePortableTextFactory({
    styles: {
      normal: {title: "Normal", value: "normal"},
      h2: {title: "Heading 2", value: "h2"},
      h3: {title: "Heading 3", value: "h3"},
    },
    blocks: {
      image: defineField({ type: "image", name: "image" }),
      code: defineField({ type: "code", name: "code" }),
    },
    annotations: {
      link: defineField({ name: "link", type: "object", fields: [...] }),
    },
  });

  // Use it across schemas
  defineField({
    ...createPtBody({
      styles: ["normal", "h2", "h3"],
      blocks: ["image"],
      annotations: ["link"],
    }),
  })
  ```

### Patch Changes

- cc1b86d:
- Updated dependencies [cc1b86d]
- Updated dependencies [947c643]
  - @tinloof/sanity-extends@1.2.2
  - @tinloof/sanity-web@1.1.0

## 1.15.6

### Patch Changes

- 6f1a866: Fixed critical publishing issue by migrating package manager from Bun to pnpm. Packages are now published with properly resolved workspace dependencies instead of broken `workspace:*` protocol references, making them installable from npm. Also fixed missing repository metadata and TypeScript errors that were blocking the publish process.

## 1.15.5

### Patch Changes

- 204e4e7: Fixed publishing issue where packages were published with unresolved `workspace:*` protocol references, making them uninstallable from npm. Workspace dependencies are now properly resolved to actual version numbers during the publish process.

## 1.15.4

### Patch Changes

- Updated dependencies [739eb24]
  - @tinloof/sanity-web@1.0.0

## 1.15.3

### Patch Changes

- Updated dependencies [8fc83a4]
- Updated dependencies [739a759]
  - @tinloof/sanity-web@0.13.0

## 1.15.2

### Patch Changes

- 0fb1b20: Update dependencies to latest versions
  - Update Sanity packages to latest stable versions
  - Update Next.js and React dependencies
  - Update TypeScript and build tooling dependencies
  - Fix component type definitions for improved TypeScript compatibility
  - Remove deprecated eslint configuration

- Updated dependencies [0fb1b20]
  - @tinloof/sanity-extends@1.2.1
  - @tinloof/sanity-web@0.12.1

## 1.15.1

### Patch Changes

- Updated dependencies [739a759]
  - @tinloof/sanity-web@0.12.0

## 1.15.0

### Minor Changes

- c49739c: Add `page` abstract type to Pages Navigator plugin

  The Pages Navigator plugin now provides a reusable `page` abstract that includes common page fields like SEO and pathname configuration. This abstract is automatically injected when using the plugin and requires `@tinloof/sanity-extends` to be configured.

  The page abstract includes:
  - SEO fields (meta title, description, og:image)
  - Pathname field with i18n support
  - Content and settings field groups

  Documents can extend from it:

  ```ts
  defineType({
    type: "document",
    name: "landingPage",
    extends: "page",
    // ... custom fields
  });
  ```

  The abstract can be disabled via plugin configuration:

  ```ts
  pages({
    abstracts: false, // or { page: false }
    // ... other config
  });
  ```

### Patch Changes

- Updated dependencies [67eece5]
- Updated dependencies [c49739c]
  - @tinloof/sanity-extends@1.2.0

## 1.14.0

### Minor Changes

- 723e30e: Add `sectionsBodyArraySchema` function for creating sections body array fields

  This new function provides a convenient way to create array fields for sections in Sanity Studio documents. It operates synchronously and requires a `sections` array to be provided for maximum compatibility across all Sanity Studio setups.

  ## Features
  - **Required sections parameter**: Must provide a `sections` array containing the section schemas to use
  - **Simple preview image configuration**: Pass a function to customize image URLs for section insert menus
  - **Grid view insert menu**: Visual section picker with preview images
  - **Type-safe configuration**: Full TypeScript support with proper return types
  - **Universal compatibility**: Works in all Sanity Studio setups (standalone and embedded)

  ## Usage

  ```typescript
  import { sectionsBodyArraySchema } from "@tinloof/sanity-studio";

  // Basic usage
  export default defineType({
    name: "page",
    type: "document",
    fields: [
      sectionsBodyArraySchema({
        sections: [
          { name: "hero", title: "Hero Section" },
          { name: "banner", title: "Banner Section" },
        ],
      }),
    ],
  });

  // With custom preview image function
  export default defineType({
    name: "page",
    type: "document",
    fields: [
      sectionsBodyArraySchema({
        sections: [
          { name: "hero", title: "Hero Section" },
          { name: "banner", title: "Banner Section" },
        ],
        previewImage: (type) =>
          `/static/sections/${type.replace("section.", "")}.png`,
      }),
    ],
  });
  ```

### Patch Changes

- Updated dependencies [d3f0d97]
  - @tinloof/sanity-web@0.11.0

## 1.13.1

### Patch Changes

- 47d2f17: Remove default "settings" group assignment from schema fields

  Removes the hardcoded `group: "settings"` property from SEO object, pathname slug, and internal title fields to allow more flexible grouping in document schemas. This gives developers full control over field organization without being constrained by default group assignments.

  **Affected fields:**
  - `seo` object field
  - `pathname` slug field
  - `internalTitle` string field

  This is a non-breaking change that only removes default grouping behavior while preserving all field functionality.

## 1.13.0

### Minor Changes

- fb4ac21: Fork of the Sanity i18n with better defaults and seperating it to a seperate package

  BREAKING: Deprecate documentI18n plugin in favor of @tinloof/sanity-document-i18n

  The `documentI18n` plugin has been moved to a separate package `@tinloof/sanity-document-i18n` with enhanced features and better template management.

  **Migration required:**
  1. Install the new package:

     ```bash
     npm install @tinloof/sanity-document-i18n
     ```

  2. Update your imports:

     ```typescript
     // OLD (deprecated)
     import { documentI18n } from "@tinloof/sanity-studio";

     // NEW (recommended)
     import { documentI18n } from "@tinloof/sanity-document-i18n";
     ```

  3. Update your configuration:
     ```typescript
     export default defineConfig({
       plugins: [
         documentI18n({
           locales: [
             { id: "en", title: "English" },
             { id: "fr", title: "French" },
           ],
         }),
       ],
     });
     ```

## 1.12.0

### Minor Changes

- b8e00f9: Updates the `@sanity` peer dependency to support v4

### Patch Changes

- 85860d2: Fix pathname prefix handling in pages navigator and preview functionality

  This patch addresses several issues related to pathname prefixes in the pages navigator:
  - **Fixed preview button navigation**: The preview button in the pathname field component now correctly applies prefixes when navigating to pages, preventing broken links when pathname prefixes are configured
  - **Enhanced navigator context with prefix support**: Added automatic detection and application of pathname prefixes from document schema definitions to ensure consistent URL generation throughout the navigator
  - **Improved prefix normalization**: Implemented robust prefix handling that prevents double-prefixing and correctly formats URLs with leading/trailing slash management
  - **Schema-aware prefix mapping**: The navigator now extracts prefix configurations from document type schemas and applies them consistently across the navigation tree

  These changes ensure that when using pathname prefixes (e.g., `/blog` for blog posts), both the preview functionality and navigator display the correct URLs without manual intervention.

- Updated dependencies [58492bd]
- Updated dependencies [6e1f75f]
  - @tinloof/sanity-web@0.10.0

## 1.11.0

### Minor Changes

- b1b4195: getRedirects util
- 01ba52b: Redirects Schema
- 90ad106: Singleton list item structure utility

### Patch Changes

- 3c7a78f: README updated
- Updated dependencies [1105a25]
- Updated dependencies [13921cd]
- Updated dependencies [6f18d6c]
- Updated dependencies [b1b4195]
- Updated dependencies [3c7a78f]
  - @tinloof/sanity-web@0.9.0

## 1.10.1

### Patch Changes

- Updated dependencies [f826214]
  - @tinloof/sanity-web@0.8.1

## 1.10.0

### Minor Changes

- 558a726: Only show valid items and folders

## 1.9.1

### Patch Changes

- 4dab9d0: Icon select component styles update

## 1.9.0

### Minor Changes

- 862b9cf: Pages navigator filter

## 1.8.0

### Minor Changes

- 4b7f06a: use `sanity/presentation` instead of `@sanity/presentation`

### Patch Changes

- 671f87b: Pioritise document initial value over current folder
- c32a811: Sanity presentation import fix
- Updated dependencies [4b7f06a]
  - @tinloof/sanity-web@0.8.0

## 1.7.5

### Patch Changes

- a661a98: definePathname uniqueness check updated

## 1.7.4

### Patch Changes

- 7df28de: Icon option to localizedItem
- cc217b1: Fix pages navigator list performance for large items lists

## 1.7.3

### Patch Changes

- 986ee30: Background color option and override tailwindcss img styles

## 1.7.2

### Patch Changes

- 4cf564d: iconSchema path option

## 1.7.1

### Patch Changes

- 120cb3c: Navigator hotfix

## 1.7.0

### Minor Changes

- 281f590: Input with characters count component

## 1.6.1

### Patch Changes

- 070b307: Disable creation plugin made simplier

## 1.6.0

### Minor Changes

- fe72e4f: Disable creation plugin

## 1.5.0

### Minor Changes

- 3fe5ab5: Icon schema with custom select component
- 164b8db: Support React 19
- aa66ce9: localizedItem utility added to aid with i18n structure organization

### Patch Changes

- Updated dependencies [164b8db]
  - @tinloof/sanity-web@0.7.0

## 1.4.0

### Minor Changes

- 1f6a3b8: Support Next 15 and React 19

### Patch Changes

- 85e2320: Improve sections
- 21c7dc8: Updated dependency `@sanity/icons` to `^3.2.0`.
  Updated dependency `react-rx` to `^3.0.0`.
- Updated dependencies [85e2320]
- Updated dependencies [1f6a3b8]
  - @tinloof/sanity-web@0.6.0

## 1.3.5

### Patch Changes

- Updated dependencies [f07b1c6]
  - @tinloof/sanity-web@0.5.0

## 1.3.4

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
- 454a00f: Correctly render document titles.
- Updated dependencies [89b54ad]
  - @tinloof/sanity-web@0.4.3

## 1.3.3

### Patch Changes

- 8059797: fix pages navigator scrolling to last item issue

## 1.3.2

### Patch Changes

- 754535d: fix skeleton list items error as all keys undefined
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
- 928c529: fix navigator preview image being too large
- Updated dependencies [55dae45]
  - @tinloof/sanity-web@0.4.2

## 1.3.1

### Patch Changes

- 95a15b3: Properly render custom folder titles when i18n is enabled and add ability to have localized folder titles using a callback function.
- 9e62382: Updated dependency `@sanity/presentation` to `^1.16.0`.
  Updated dependency `@sanity/ui` to `^2.4.0`.
  Updated dependency `@sanity/util` to `^3.46.1`.
  Updated dependency `@typescript-eslint/eslint-plugin` to `^7.13.1`.
  Updated dependency `@typescript-eslint/parser` to `^7.13.1`.
  Updated dependency `npm-run-all2` to `^5.0.2`.
  Updated dependency `sanity` to `^3.46.1`.
- Updated dependencies [9e62382]
  - @tinloof/sanity-web@0.4.1

## 1.3.0

### Minor Changes

- a09d24f: Add support for the `source` field, which when set will render a button to generate the pathname similar to Sanity's `Slug` type. Thanks @marcusforsberg!
- 29a848a: Add option to use a custom `localizePathname` function in the Pages plugin and in pathname fields. Thanks @marcusforsberg!
- ac331cf: Add requireLocale option to allow working with non-translatable page types even with i18n enabled. Thanks @marcusforsberg!
- 7dd9046: Add `autoNavigate` option to hide the "Preview" button and automatically navigate as the pathname changes. Thanks @marcusforsberg!
- ab53988: Add `folders` config option which can be used to customize the icons and titles for individual folders based on their pathnames. Thanks @marcusforsberg!

### Patch Changes

- 2a263d7: Hide the "Preview" button from the `pathname` field when used in the Structure Tool (where it has no effect).
- 4289934: Add missing "group" and "fieldset" properties to PathnameParams. Thanks @marcusforsberg!
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
- Updated dependencies [29a848a]
- Updated dependencies [4c92cc8]
  - @tinloof/sanity-web@0.4.0

## 1.2.1

### Patch Changes

- a3677bb: - fix(pathname): add back `window.location.origin` as default pathname prefix. Thanks @marcusforsberg!
  - fix(PreviewMedia): add new render condition for when element is of type object. Thanks @gercordero!

## 1.2.0

### Minor Changes

- e5aa2a8: Add prefix option to definePathname. Thanks @Jamiewarb!

### Patch Changes

- 08efb47: Add validation UI to input. Thanks @tamaccount.
- Updated dependencies [8575999]
  - @tinloof/sanity-web@0.3.1

## 1.1.3

### Patch Changes

- c96e9f7: Fix: `definePathname` initialValue is now used when creating new documents from the pages navigator.

## 1.1.2

### Patch Changes

- Updated dependencies [0696902]
  - @tinloof/sanity-web@0.3.0

## 1.1.1

### Patch Changes

- Updated dependencies [5fe8baf]
  - @tinloof/sanity-web@0.2.1

## 1.1.0

### Minor Changes

- e48e6e5: Add `folder.canUnlock` options to `definePathname` helper. Thanks @Jamiewarb for the PR.

  Update `README` with `folder.canUnlock` example.

  Fix `<PathnameFieldComponent />` component trailing dash issue. Thanks @Jamiewarb and @tamaccount.

  Add `<SearchArrayInput />` component to filter array fields.

### Patch Changes

- ec602d8: Update dependencies
- Updated dependencies [e48e6e5]
- Updated dependencies [ec602d8]
  - @tinloof/sanity-web@0.2.0

## 1.0.2

### Patch Changes

- 5beeb0a: Fix folder ListItem rendering

## 1.0.1

### Patch Changes

- b442ca5: Fix pages plugin issues when schemaType is undefined. From now on, pages navigator ListItem will not render if schemaType is undefined.

## 1.0.0

### Major Changes

- 3899f1a: The pages plugin list items now render document icon

## 0.4.1

### Patch Changes

- a09953c: - Add support for preview data, now you can use document schema preview to render pages navigator items preview data
  - Update README
  - Update dependencies
- Updated dependencies [a09953c]
  - @tinloof/sanity-web@0.1.1

## 0.4.0

### Minor Changes

- Rename pagesNavigator to pages + add title plugin option

## 0.3.1

### Patch Changes

- Bug fixes and Sanity upgrade

## 0.3.0

### Minor Changes

- Minor global improvements

## 0.2.1

### Patch Changes

- Fix minor locale bug in PathnameFieldComponent

## 0.2.0

### Minor Changes

- definePathname bug fixes

## 0.1.2

### Patch Changes

- Add config options for navigator

## 0.1.1

### Patch Changes

- Fix: Handle empty pathname and desk tools outside of presentation

## 0.1.0

### Minor Changes

- Initial version

### Patch Changes

- Updated dependencies
  - @tinloof/sanity-web@0.1.0

## 0.1.27

### Patch Changes

- Avoid showing default locale in path

## 0.1.26

### Patch Changes

- Only show locales selector when it makes sense

## 0.1.25

### Patch Changes

- Initial version

## 0.1.0

### Minor Changes

- Initial version
