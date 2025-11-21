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

## Features

- Multi-language document support with language selection dropdown
- Language badges on documents for quick visual identification
- Automatic translation templates for each language
- **Enhanced template management**: Automatically removes default templates for localized schema types to avoid confusion
- Translation metadata management
- Delete translation actions
- Duplicate documents with existing translations

## License

ISC
