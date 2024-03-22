# @tinloof/sanity-studio

A collection of Sanity studio plugins, fields, and components.

## Installation

```sh
npm install @tinloof/sanity-studio
```

## Table of contents

- [Table of contents](#table-of-contents)
- [Sanity Plugins](#sanity-plugins)
  - [`pages`](#pages)
  - [`documentI18n`](#documenti18n)
- [Sanity Fields](#sanity-fields)
  - [`definePathname`](#definepathname)
  - [`defineSection`](#definesection)
- [Sanity Components](#sanity-components)
  - [`<SectionsArrayInput />`](#sectionsarrayinput)

## Sanity Plugins

### `pages`

The `pages` plugin is a wrapper around Sanity's `presentation` plugin.
When enabled, it will add Tinloof's pages navigator to the prensentation view.
With this plugin, you can easily navigate through your content and quickly create new documents.

Usage example:

```tsx
import { pages } from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      previewUrl: {
        draftMode: {
          // Enable draft mode path
          enable: "/api/draft",
        },
      },
      // Add any documents you want to be creatable
      creatablePages: ["page"],
      title: "Your personalized title",
    }),
  ],
});
```

### `documentI18n`

The `documentI18n` plugin can be used for projects needing translations.
It uses the Sanity's [Document Internationalization](https://www.sanity.io/plugins/document-internationalization) plugin under the hood.
The plugin will allow you to create unique translations of a document.

Usage example:

```tsx
import { documentI18n, pages } from "@tinloof/sanity-studio";
import schemas from "@/sanity/schemas";

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
    documentI18n({
      ...i18nConfig,
      schemas,
    }),
    // documentI18n can be used in combination with the pages plugin
    pages({
      previewUrl: {
        draftMode: {
          enable: "/api/draft",
        },
      },
      creatablePages: ["page"],
      // Add your i18n config here
      i18n: i18nConfig,
    }),
  ],
});
```

## Sanity Fields

### `definePathname`

The `definePatnhname` field is where the magic happens. It uses the `PathnameFieldComponent` component under the hood and gives you the ability to create custom pathnames with as many slugs/levels as you want.

`definePatnhname` is used by the `pages` plugin and makes the navigation of your content faster.

As an example, the path `/blog/{your-slug}/article` will be parsed by the `pages` plugin so it will automatically generate a `Blog` folder with all documents using the same pathname structure.

Usage example:

```tsx
export default defineType({
  type: "document",
  name: "page",
  fields: [
    // ... other fields
    definePathname({ name: "pathname" }),
  ],
});
```

### `defineSection`

The `defineSection` field lets you easily define a new section schema. Used in combination with the `SectionsArrayInput` component, it will render a useful section picker in your Sanity documents.

#### Step 1: Create a new section schema

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

#### Step 2: Create a sections list array

```tsx
// @/sanity/schemas/sections/index.tsx

import { bannerSection } from "@/sanity/schemas/sections/banner";

export const sections = [bannerSection];
```

#### Step 3: Add a section picker to your document

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

#### Step 4: Add sections to your Sanity schema

```tsx
// @/sanity/schemas/index.tsx

import { sections } from "@sanity/schemas/index";
import page from "@/sanity/schemas/page";

const schemas = [page, ...sections];

export default schemas;
```

## Components

### `SectionsArrayInput`

The `SectionsArrayInput` component is used in combination with the `defineSection` field. It will render a useful section picker in your Sanity documents.

![define section](https://github.com/tinloof/sanity-kit/assets/10447155/85ccaa9e-16fa-4ddd-9938-f0e5f55061e3)

## Examples

Check the `/examples` folder.

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
