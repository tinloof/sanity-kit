# @tinloof/sanity-studio

A collection of studio plugins, fields, and components to boost your Sanity studio.

https://github.com/tinloof/sanity-kit/assets/10447155/070ecda4-c52c-4972-a955-8207bc4c3a6e

## Installation

```sh
npm install @tinloof/sanity-studio
```

## Table of contents

- [Table of contents](#table-of-contents)
- [`pages`](#pages)
  - [Basic usage](#basic-usage)
  - [Add pathname field](#add-pathname-field)
  - [Enabling page creation](#enabling-page-creation)
  - [Add internationalization](#add-internationalization)
- [`defineSection`](#definesection)
  - [Create a new section schema](#step-1-create-a-new-section-schema)
  - [Create a sections list array](#step-2-create-a-sections-list-array)
  - [Add a section picker to your document](#step-3-add-a-section-picker-to-your-document)
  - [Add sections to your Sanity schema](#step-4-add-sections-to-your-sanity-schema)
- [`documentI18n`](#documenti18n)

## Pages

Pages is a plugin that wraps [Presentation](https://www.sanity.io/docs/presentation) to display your website pages in a sitemap-like navigation and make it possible to create new ones.


### Basic usage

#### 1. Configure Pages:

```tsx
import { pages } from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      /**
       * See Presentation Tool configuration reference for more info
       */
      previewUrl: {
        draftMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});
```

#### 2. Add a `pathname` field to page schemas using the `definePage` helper:

```tsx
import { definePathname } from "@tinloof/sanity-studio";

export default defineType({
  type: "document",
  name: "modularPage",
  fields: [
    definePathname({ name: "pathname" }),
  ],
});
```

Documents with a defined `pathname` field value are now recognized as pages and are automatically grouped into directories in the pages navigator.


### Enabling page creation

Use the `creatablePages` option to define which schema types can be used to create pages.

When a page is created, it will automatically have the current folder in its pathname.

https://github.com/tinloof/sanity-kit/assets/10447155/99c88e5a-5989-40a8-bd4c-09b0aa0ac17b


```tsx
import { pages } from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      // Add any documents you want to be creatable from the pages navigator
      creatablePages: ["page"],
      previewUrl: {
        draftMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});
```

### Enabling internationalization

The `i18n` option can be used to support filtering pages by a `locale` field and displaying internationalized URLs.

When page creation is enabled, the currently selected `locale` is also used as an initial value to create new pages.

https://github.com/tinloof/sanity-kit/assets/10447155/ba962e75-3158-44fb-9593-0360fc631fde


```tsx
import { pages } from "@tinloof/sanity-studio";

const i18nConfig = {
  locales: [
    { id: "en", title: "English" },
    { id: "fr", title: "French" },
  ],
  defaultLocaleId: "en",
};

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      i18n: i18nConfig,
      previewUrl: {
        draftMode: {
          enable: "/api/draft",
        },
      },
    }),
  ],
});

/**
 * Don't forget to add i18n options and locale field to your document schema
 */
export default defineType({
  type: "document",
  name: "page",
  fields: [
    definePathname({
      name: "pathname",
      options: {
        // Add i18n options
        i18n: {
          enabled: true,
          defaultLocaleId: i18nConfig.defaultLocaleId,
        },
      },
    }),
    // Add locale field
    defineField({
      type: "string",
      name: "locale",
      hidden: true,
    }),
  ],
});
```

### Customizing pages previews

Documents can have their preview customized on the pages navigator using the [List Previews API](https://www.sanity.io/docs/previews-list-views):

```tsx
export default {
  name: "movie",
  type: "document",
  fields: [
    {
      title: "Title",
      name: "title",
      type: "string",
    },
    {
      title: "Release Date",
      name: "releaseDate",
      type: "date",
    },
  ],
  // Preview information
  preview: {
    select: {
      title: "title",
      subtitle: "releaseDate",
    },
  },
};
```


## Sections

The `defineSection` field lets you easily define a new section schema. Used in combination with the `SectionsArrayInput` component, it will render a useful section picker in your Sanity documents.

https://github.com/tinloof/sanity-kit/assets/10447155/41b65857-687e-42bb-97e5-fe3f5ec23c63

#### 1. Create a new section schema

```tsx
// @/sanity/schemas/sections/banner.tsx
export const bannerSection = defineSection({
  name: "block.banner",
  title: "Banner",
  type: "object",
  options: {
    variants: [
      {
        /**
         * Will be used to display a preview image
         * when opening the section picker
         */
        assetUrl: "/images/blocks/hero.png",
      },
    ],
  },
  fields: [
    defineField({
      name: "bannerSection",
      type: "string",
    }),
  ],
});
```

#### 2. Create a sections list array

```tsx
// @/sanity/schemas/sections/index.tsx

import { bannerSection } from "@/sanity/schemas/sections/banner";

export const sections = [bannerSection];
```

#### 3. Add a section picker to your document

Here, the `SectionsArrayInput` component is used to render a useful section picker in your Sanity documents.

```tsx
// @/sanity/schemas/sections/index.tsx

import { sections } = "@/sanity/schemas/sections/index";
import { SectionsArrayInput } from "@tinloof/sanity-studio";

export default defineType({
  name: "page",
  type: "document",
  // ... other fields
  fields: [
    defineField({
      name: 'sectionPicker',
      title: 'Section Picker',
      type: 'array',
      of: sections.map((section) => ({
        type: section.name,
      })),
      components: {
        input: SectionsArrayInput,
      },
    }),
  ]
})
export const sections = [bannerSection];
```

#### 4. Add sections to your Sanity schema

```tsx
// @/sanity/schemas/index.tsx

import { sections } from "@sanity/schemas/index";
import page from "@/sanity/schemas/page";

const schemas = [page, ...sections];

export default schemas;
```

## `documentI18n`

The `documentI18n` plugin can be used for projects needing document level translations. It uses the Sanity's [Document Internationalization](https://www.sanity.io/plugins/document-internationalization) plugin under the hood and allows you to dynamically specify your schemas. The plugin will allow you to create unique translations of a document.

## Examples

Check the `/examples` folder.

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
