# @tinloof/sanity-document-i18n

A Sanity Studio plugin that enables internationalization (i18n) for documents with language selection, translation management.

> This is a fork of [sanity-io/document-internationalization](https://github.com/sanity-io/document-internationalization).

## Installation

```bash
pnpm add @tinloof/sanity-document-i18n
```

## Upgrading to the Sanity 6 release

This release requires Sanity `^6.12.0` (stable major 6 from 6.12; Sanity 5 is no longer supported), React and React DOM 19.2.4 or later within major 19, Sanity UI 4, and Sanity icons 5. Sanity requires Node.js 22.12 or later. Repository development uses Node.js 24.18 and pnpm 12.3.4.

Existing standalone-plugin data does not need a migration. Content documents keep their configured `localeField` (default: `locale`), and translation metadata keeps the locale ID in each reference's `_key`. No `language` metadata field is added. Keep the same locale IDs and `localeField` when updating an existing Studio.

The consuming Studio configures `locales`, `localeField`, and reference behavior through `documentI18n(...)`. Use the standalone import shown below. The deprecated wrapper is removed in `@tinloof/sanity-studio` 3. Remove its `schemas` option when switching imports; the standalone plugin infers localized schema types from their locale field.

This compatibility statement covers data created by this standalone plugin. Data written by other internationalization plugins with a different metadata format needs a separate compatibility review.

The standard `definePathname` helper from `@tinloof/sanity-studio` preserves locale-aware uniqueness on Sanity 6.13.1. Sanity still has an upstream regression affecting raw slug schemas, including named aliases and precompiled validation rules. The translation plugin does not patch those schemas. If your Studio uses them, verify its custom uniqueness checks; Sanity 6.12.0 remains within the supported range while an upstream fix is pending.

Ordinary localized document actions include translation-group duplication and reference-aware deletion. Published references are strengthened with revision guards unless `weakReferences` is enabled. Duplication can leave new draft copies if a later operation fails; inspect and remove those copies before retrying. The plugin does not roll back successful copies.

Bulk publishing is currently disabled in the implementation. The upgrade does not enable it.

## Setup

Add the plugin to your Sanity config:

```typescript
import {defineConfig} from "sanity";
import {structureTool} from "sanity/structure";
import {documentI18n} from "@tinloof/sanity-document-i18n";

export default defineConfig({
  plugins: [
    structureTool(),
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

Place `documentI18n()` after `structureTool()` so its translation actions can extend Sanity's default actions. If you use `documentOptions()` with its Structure tool enabled, place that before `documentI18n()` instead of adding another `structureTool()`.

## Configuration

The plugin accepts the following configuration options:

- `locales` - Array of locale objects with `id` and `title` properties
- `localeField` - The field name used to store the language/locale value (default: `"locale"`)
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
