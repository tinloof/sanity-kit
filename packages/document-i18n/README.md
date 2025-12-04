# @tinloof/sanity-document-i18n

A Sanity Studio plugin that enables internationalization (i18n) for documents with language selection, translation management, and bulk publishing capabilities.

> This is a fork of [sanity-io/document-internationalization](https://github.com/sanity-io/document-internationalization).

## Installation

```bash
pnpm add @tinloof/sanity-document-i18n
```

## Setup

Add the plugin to your Sanity config:

```typescript
import {defineConfig} from "sanity";
import {documentI18n} from "@tinloof/sanity-document-i18n";

export default defineConfig({
  plugins: [
    documentI18n({
      locales: [
        {id: "en", title: "English"},
        {id: "fr", title: "Français"},
        {id: "es", title: "Español"},
      ],
    }),
  ],
});
```

## Configuration

The plugin accepts the following configuration options:

- `locales` - Array of locale objects with `id` and `title` properties
- `languageField` - The field name used to store the language/locale value (default: `"locale"`)
- `abstracts` - Configuration for abstract schemas (enabled by default with i18n abstract)

## Features

- Multi-language document support with language selection dropdown
- Language badges on documents for quick visual identification
- Automatic translation templates for each language
- **Enhanced template management**: Automatically removes default templates for localized schema types to avoid confusion
- Translation metadata management
- Delete translation actions
- Duplicate documents with existing translations
- **i18n Abstract**: Automatically injected abstract schema for better i18n field organization

### i18n Abstract

The plugin now includes an i18n abstract that is automatically injected by default. This abstract helps organize internationalization fields in a consistent way across your schemas.

#### Default Behavior

The i18n abstract is enabled by default and provides a standardized way to handle i18n fields in your documents. To use this feature, you need to install `@tinloof/sanity-extends` and wrap your schema types with `withExtends`:

```typescript
import {defineConfig} from "sanity";
import {documentI18n} from "@tinloof/sanity-document-i18n";
import {withExtends} from "@tinloof/sanity-extends";

export default defineConfig({
  plugins: [
    documentI18n({
      locales: [
        {id: "en", title: "English"},
        {id: "fr", title: "Français"},
      ],
    }),
  ],
  schema: {
    types: withExtends([
      // Your schema types here
      // Documents can now use: extends: "i18n"
    ]),
  },
});
```

> **Note**: The `withExtends` wrapper from `@tinloof/sanity-extends` is required for the i18n abstract feature to work properly.

#### Disabling the i18n Abstract

If you prefer not to use the i18n abstract, you can disable it by setting `abstracts` to `false` in the plugin configuration:

```typescript
import {defineConfig} from "sanity";
import {documentI18n} from "@tinloof/sanity-document-i18n";

export default defineConfig({
  plugins: [
    documentI18n({
      locales: [
        {id: "en", title: "English"},
        {id: "fr", title: "Français"},
      ],
      abstracts: false, // Disable the i18n abstract
    }),
  ],
});
```

## License

ISC
