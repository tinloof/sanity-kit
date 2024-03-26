# @tinloof/sanity-studio

A collection of Sanity studio plugins, fields, and components.

https://github.com/tinloof/sanity-kit/assets/10447155/070ecda4-c52c-4972-a955-8207bc4c3a6e

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

## Sanity Plugins

### `pages`

The `pages` plugin is a wrapper around Sanity's `presentation` plugin. When enabled, it will add Tinloof's pages navigator to the presentation view.

With this plugin, you can easily navigate through your content and quickly create new documents. `pages` also supports internationalization.

You can learn more about configuring Sanity's Presentation Tool [here](https://www.sanity.io/docs/configuring-the-presentation-tool#27749b6d3aa5).

#### Usage example

```tsx
import { pages } from "@tinloof/sanity-studio";

export default defineConfig({
  // ... other Sanity Studio config
  plugins: [
    pages({
      /**
       * See Presentation Tool configuration reference for more info
       * https://www.sanity.io/docs/configuring-the-presentation-tool#27749b6d3aa5
       */
      previewUrl: {
        draftMode: {
          // Enable draft mode path
          enable: "/api/draft",
        },
      },
    }),
  ],
});
```

#### Using `creatablePages`

Use the `creatablePages` option to define which pages you want to be creatable from the pages navigator.

https://github.com/tinloof/sanity-kit/assets/10447155/99c88e5a-5989-40a8-bd4c-09b0aa0ac17b

Usage example:

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
          // Enable draft mode path
          enable: "/api/draft",
        },
      },
    }),
  ],
});
```

#### Add internationalization

You can specify a list of locales if you want to support multiple languages. The pages navigator will then allow you to switch between locales. If the `creatablePages` option is set, the selected language will be used to create new pages.

https://github.com/tinloof/sanity-kit/assets/10447155/ba962e75-3158-44fb-9593-0360fc631fde

Usage example:

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
      /**
       * i18n config to support multiple locales
       */
      i18n: i18nConfig,
      previewUrl: {
        draftMode: {
          // Enable draft mode path
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

#### Customize documents previews

You can customize list previews of your documents in pages navigator as you would normally do with Sanity. You can control this by adding a preview key to the type defined in the schema. For example:

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

Learn more about preview customization [here](https://www.sanity.io/docs/previews-list-views).

### `documentI18n`

The `documentI18n` plugin can be used for projects needing document level translations. It uses the Sanity's [Document Internationalization](https://www.sanity.io/plugins/document-internationalization) plugin under the hood and allows you to dynamically specify your schemas. The plugin will allow you to create unique translations of a document.

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

With i18n options:

```tsx
export default defineType({
  type: "document",
  name: "page",
  fields: [
    // ... other fields
    definePathname({
      name: "pathname",
      options: {
        i18n: {
          enabled: true,
          defaultLocaleId: "en",
        },
      },
    }),
  ],
});
```

### `defineSection`

The `defineSection` field lets you easily define a new section schema. Used in combination with the `SectionsArrayInput` component, it will render a useful section picker in your Sanity documents.

https://github.com/tinloof/sanity-kit/assets/10447155/41b65857-687e-42bb-97e5-fe3f5ec23c63

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

#### Step 4: Add sections to your Sanity schema

```tsx
// @/sanity/schemas/index.tsx

import { sections } from "@sanity/schemas/index";
import page from "@/sanity/schemas/page";

const schemas = [page, ...sections];

export default schemas;
```

## Examples

Check the `/examples` folder.

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
