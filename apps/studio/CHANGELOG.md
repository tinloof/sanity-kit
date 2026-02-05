# vite-studio

## 1.2.14

### Patch Changes

- Updated dependencies [2d358f3]
  - @tinloof/sanity-document-i18n@2.0.1
  - @tinloof/sanity-extends@2.0.1
  - @tinloof/sanity-document-options@2.0.1
  - @tinloof/sanity-studio@2.0.1

## 1.2.13

### Patch Changes

- Updated dependencies [2d358f3]
  - @tinloof/sanity-document-i18n@2.0.0
  - @tinloof/sanity-extends@2.0.0
  - @tinloof/sanity-document-options@2.0.0
  - @tinloof/sanity-studio@2.0.0

## 1.2.12

### Patch Changes

- Updated dependencies [6a563a4]
- Updated dependencies [be34033]
- Updated dependencies [e9b662f]
- Updated dependencies [abca273]
  - @tinloof/sanity-studio@2.0.0
  - @tinloof/sanity-document-options@2.0.0
  - @tinloof/sanity-document-i18n@2.0.0
  - @tinloof/sanity-extends@2.0.0

## 1.2.11

### Patch Changes

- Updated dependencies [51c2917]
  - @tinloof/sanity-studio@1.16.2

## 1.2.10

### Patch Changes

- Updated dependencies [17e5837]
  - @tinloof/sanity-document-options@1.3.2
  - @tinloof/sanity-studio@1.16.1

## 1.2.9

### Patch Changes

- Updated dependencies [cc1b86d]
- Updated dependencies [947c643]
  - @tinloof/sanity-document-i18n@1.1.4
  - @tinloof/sanity-extends@1.2.2
  - @tinloof/sanity-document-options@1.3.1
  - @tinloof/sanity-studio@1.16.0

## 1.2.8

### Patch Changes

- Updated dependencies [4d7aab9]
  - @tinloof/sanity-document-options@1.3.0

## 1.2.7

### Patch Changes

- Updated dependencies [6f1a866]
  - @tinloof/sanity-document-options@1.2.3
  - @tinloof/sanity-document-i18n@1.1.3
  - @tinloof/sanity-studio@1.15.6

## 1.2.6

### Patch Changes

- Updated dependencies [204e4e7]
  - @tinloof/sanity-document-options@1.2.2
  - @tinloof/sanity-document-i18n@1.1.2
  - @tinloof/sanity-studio@1.15.5

## 1.2.5

### Patch Changes

- @tinloof/sanity-studio@1.15.4

## 1.2.4

### Patch Changes

- @tinloof/sanity-studio@1.15.3

## 1.2.3

### Patch Changes

- Updated dependencies [0fb1b20]
  - @tinloof/sanity-document-i18n@1.1.1
  - @tinloof/sanity-extends@1.2.1
  - @tinloof/sanity-document-options@1.2.1
  - @tinloof/sanity-studio@1.15.2

## 1.2.2

### Patch Changes

- Updated dependencies [db1c824]
  - @tinloof/sanity-document-i18n@1.1.0
  - @tinloof/sanity-studio@1.15.1

## 1.2.1

### Patch Changes

- Updated dependencies [1bd5f99]
- Updated dependencies [c49739c]
- Updated dependencies [67eece5]
- Updated dependencies [c49739c]
  - @tinloof/sanity-document-options@2.0.0
  - @tinloof/sanity-studio@2.0.0
  - @tinloof/sanity-extends@1.2.0

## 1.2.0

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

- Updated dependencies [723e30e]
  - @tinloof/sanity-studio@1.14.0

## 1.1.20

### Patch Changes

- Updated dependencies [517151b]
- Updated dependencies [c7491b3]
- Updated dependencies [51862a9]
- Updated dependencies [2961a35]
- Updated dependencies [c7491b3]
- Updated dependencies [629c182]
- Updated dependencies [51862a9]
  - @tinloof/sanity-extends@1.1.0
  - @tinloof/sanity-document-options@2.0.0

## 1.1.19

### Patch Changes

- Updated dependencies [6f19a78]
  - @tinloof/sanity-document-options@1.0.0

## 1.1.18

### Patch Changes

- Updated dependencies [47d2f17]
  - @tinloof/sanity-studio@1.13.1

## 1.1.17

### Patch Changes

- Updated dependencies [fb4ac21]
  - @tinloof/sanity-studio@1.13.0
  - @tinloof/sanity-document-i18n@1.0.0

## 1.1.16

### Patch Changes

- Updated dependencies [85860d2]
- Updated dependencies [b8e00f9]
  - @tinloof/sanity-studio@1.12.0

## 1.1.15

### Patch Changes

- Updated dependencies [3c7a78f]
- Updated dependencies [b1b4195]
- Updated dependencies [01ba52b]
- Updated dependencies [90ad106]
  - @tinloof/sanity-studio@1.11.0

## 1.1.14

### Patch Changes

- @tinloof/sanity-studio@1.10.1

## 1.1.13

### Patch Changes

- Updated dependencies [558a726]
  - @tinloof/sanity-studio@1.10.0

## 1.1.12

### Patch Changes

- Updated dependencies [4dab9d0]
  - @tinloof/sanity-studio@1.9.1

## 1.1.11

### Patch Changes

- Updated dependencies [862b9cf]
  - @tinloof/sanity-studio@1.9.0

## 1.1.10

### Patch Changes

- Updated dependencies [671f87b]
- Updated dependencies [4b7f06a]
- Updated dependencies [c32a811]
  - @tinloof/sanity-studio@1.8.0

## 1.1.9

### Patch Changes

- Updated dependencies [a661a98]
  - @tinloof/sanity-studio@1.7.5

## 1.1.8

### Patch Changes

- Updated dependencies [7df28de]
- Updated dependencies [cc217b1]
  - @tinloof/sanity-studio@1.7.4

## 1.1.7

### Patch Changes

- Updated dependencies [986ee30]
  - @tinloof/sanity-studio@1.7.3

## 1.1.6

### Patch Changes

- Updated dependencies [4cf564d]
  - @tinloof/sanity-studio@1.7.2

## 1.1.5

### Patch Changes

- Updated dependencies [120cb3c]
  - @tinloof/sanity-studio@1.7.1

## 1.1.4

### Patch Changes

- Updated dependencies [281f590]
  - @tinloof/sanity-studio@1.7.0

## 1.1.3

### Patch Changes

- Updated dependencies [070b307]
  - @tinloof/sanity-studio@1.6.1

## 1.1.2

### Patch Changes

- Updated dependencies [fe72e4f]
  - @tinloof/sanity-studio@1.6.0

## 1.1.1

### Patch Changes

- Updated dependencies [3fe5ab5]
- Updated dependencies [164b8db]
- Updated dependencies [aa66ce9]
  - @tinloof/sanity-studio@1.5.0

## 1.1.0

### Minor Changes

- 1f6a3b8: Support Next 15 and React 19

### Patch Changes

- 85e2320: Improve sections
- Updated dependencies [85e2320]
- Updated dependencies [21c7dc8]
- Updated dependencies [1f6a3b8]
  - @tinloof/sanity-studio@1.4.0

## 1.0.16

### Patch Changes

- @tinloof/sanity-studio@1.3.5

## 1.0.15

### Patch Changes

- Updated dependencies [89b54ad]
- Updated dependencies [454a00f]
  - @tinloof/sanity-studio@1.3.4

## 1.0.14

### Patch Changes

- Updated dependencies [8059797]
  - @tinloof/sanity-studio@1.3.3

## 1.0.13

### Patch Changes

- Updated dependencies [754535d]
- Updated dependencies [55dae45]
- Updated dependencies [928c529]
  - @tinloof/sanity-studio@1.3.2

## 1.0.12

### Patch Changes

- Updated dependencies [95a15b3]
- Updated dependencies [9e62382]
  - @tinloof/sanity-studio@1.3.1

## 1.0.11

### Patch Changes

- Updated dependencies [2a263d7]
- Updated dependencies [a09d24f]
- Updated dependencies [29a848a]
- Updated dependencies [4289934]
- Updated dependencies [4c92cc8]
- Updated dependencies [ac331cf]
- Updated dependencies [7dd9046]
- Updated dependencies [ab53988]
  - @tinloof/sanity-studio@1.3.0

## 1.0.10

### Patch Changes

- Updated dependencies [a3677bb]
  - @tinloof/sanity-studio@1.2.1

## 1.0.9

### Patch Changes

- Updated dependencies [08efb47]
- Updated dependencies [e5aa2a8]
  - @tinloof/sanity-studio@1.2.0

## 1.0.8

### Patch Changes

- Updated dependencies [c96e9f7]
  - @tinloof/sanity-studio@1.1.3

## 1.0.7

### Patch Changes

- @tinloof/sanity-studio@1.1.2

## 1.0.6

### Patch Changes

- @tinloof/sanity-studio@1.1.1

## 1.0.5

### Patch Changes

- Updated dependencies [e48e6e5]
- Updated dependencies [ec602d8]
  - @tinloof/sanity-studio@1.1.0

## 1.0.4

### Patch Changes

- Updated dependencies [5beeb0a]
  - @tinloof/sanity-studio@1.0.2

## 1.0.3

### Patch Changes

- Updated dependencies [b442ca5]
  - @tinloof/sanity-studio@1.0.1

## 1.0.2

### Patch Changes

- Updated dependencies [3899f1a]
  - @tinloof/sanity-studio@1.0.0

## 1.0.1

### Patch Changes

- Updated dependencies [a09953c]
  - @tinloof/sanity-studio@0.4.1
