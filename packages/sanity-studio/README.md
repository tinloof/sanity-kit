# @tinloof/sanity-studio

A collection of Sanity studio plugins, fields, and components.

## Installation

```sh
npm install @tinloof/sanity-studio
```

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

### `defineSection`

## Components

- PathnameFieldComponent
- SectionArrayItem
- SectionsArrayInput

## Examples

Check the `/examples` folder.

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
