# @tinloof/sanity-inline-structure

A Sanity plugin that enables document schemas to configure their own structure directly within schema definitions, eliminating the need for separate structure configuration files.

## Features

- ✅ **Zero Configuration**: Works out of the box with automatic structure generation
- ✅ **Schema-First**: Configure structure directly in your document schemas
- ✅ **Grouping**: Organize documents into collapsible groups
- ✅ **Singletons**: Create single-instance documents (perfect for settings, home pages)
- ✅ **Ordering**: Built-in drag-and-drop ordering support
- ✅ **Localization**: Full i18n support with locale-specific views
- ✅ **Custom Views**: Support for additional document views
- ✅ **Extensible**: Custom structure builders for advanced use cases

## Installation

```sh
pnpm install @tinloof/sanity-inline-structure
```

## Usage

### Basic Setup

Add it as a plugin in `sanity.config.ts` (or .js):

```ts
import {defineConfig} from "sanity";
import {inlineStructure} from "@tinloof/sanity-inline-structure";

export default defineConfig({
  // ...
  plugins: [
    inlineStructure({
      // Optional: Hide specific document types
      hide: ["translation.metadata"],

      // Optional: Configure localization
      locales: [
        {id: "en", title: "English"},
        {id: "fr", title: "French"},
      ],

      // Optional: Customize the structure tool title
      toolTitle: "Content",
    }),
  ],
});
```

### Schema Configuration

The plugin works on three levels of complexity:

#### 1. Zero Configuration (Plug & Play)

Documents with no configuration automatically get basic structure:

```ts
export default defineType({
  name: "blogPost",
  type: "document",
  // No structure config needed - creates "Blog Posts" list automatically
});
```

#### 2. Built-in Options

Use predefined options for common use cases:

```ts
import {CogIcon} from "@sanity/icons";

export default defineType({
  name: "settings",
  type: "document",
  options: {
    // Group documents together
    structureGroup: "configuration",

    // Built-in structure options
    structureOptions: {
      singleton: true, // Single instance document
      icon: CogIcon, // Custom icon
      title: "Site Settings", // Custom title
    },
  },
});
```

#### 3. Custom Structure Builders

For advanced use cases, provide a custom function:

```ts
export default defineType({
  name: "product",
  type: "document",
  options: {
    structureGroup: "commerce",
    structureOptions: (S, context) =>
      S.listItem()
        .title("Products by Category")
        .icon(ShoppingCartIcon)
        .child(
          S.list()
            .title("Product Categories")
            .items([
              S.listItem()
                .title("Electronics")
                .child(
                  S.documentTypeList("product").filter(
                    'category == "electronics"',
                  ),
                ),
              S.listItem()
                .title("Clothing")
                .child(
                  S.documentTypeList("product").filter(
                    'category == "clothing"',
                  ),
                ),
            ]),
        ),
  },
});
```

## API Reference

### Plugin Options

```ts
interface InlineStructureProps {
  locales?: Locale[]; // Locale configuration for i18n
  hide?: string[]; // Document types to hide from structure
  toolTitle?: string; // Title for the structure tool
  localeFieldName?: string; // Field name for locale (default: "locale")
}
```

### Document Options

```ts
interface DocumentOptions {
  structureGroup?: string; // Group name for organization
  structureOptions?: // Structure configuration
  | StructureBuiltinOptions
    | ((
        S: StructureBuilder,
        context: StructureResolverContext,
      ) => ListItemBuilder);
}
```

### Built-in Structure Options

```ts
type StructureBuiltinOptions {
  singleton?: boolean; // Single instance document
  orderable?: boolean; // Enable drag-and-drop ordering
  icon?: React.ComponentType | React.ReactNode; // Custom icon
  title?: string; // Custom title
  views?: (S: StructureBuilder) => (View | ViewBuilder)[]; // Additional views
}
```

## Examples

### Singleton Documents

Perfect for settings, home pages, or other single-instance content:

```ts
export default defineType({
  name: "homePage",
  type: "document",
  options: {
    structureGroup: "pages",
    structureOptions: {
      singleton: true,
      icon: HomeIcon,
    },
  },
});
```

### Orderable Documents

Enable drag-and-drop ordering:

```ts
export default defineType({
  name: "menuItem",
  type: "document",
  options: {
    structureGroup: "navigation",
    structureOptions: {
      orderable: true,
      icon: MenuIcon,
    },
  },
});
```

### Localized Documents

For multi-language content:

```ts
export default defineType({
  name: "article",
  type: "document",
  options: {
    structureGroup: "content",
    localized: true, // Creates separate views per locale
  },
  fields: [
    {
      name: "locale",
      type: "string",
      hidden: true,
    },
    // ... other fields
  ],
});
```

### Custom Views

Add additional document views:

```ts
export default defineType({
  name: "page",
  type: "document",
  options: {
    structureGroup: "content",
    structureOptions: {
      views: (S) => [
        S.view.form().icon(EditIcon),
        S.view.component(MyCustomView).icon(EyeIcon).title("Preview"),
      ],
    },
  },
});
```

### Advanced Custom Structure

Create complex, dynamic structures:

```ts
export default defineType({
  name: "article",
  type: "document",
  options: {
    structureGroup: "content",
    structureOptions: (S, context) => {
      const userRole = context.currentUser?.role;

      return S.listItem()
        .title("Articles")
        .child(
          S.list()
            .title("Articles by Status")
            .items([
              S.listItem()
                .title("Published")
                .child(
                  S.documentTypeList("article").filter("published == true"),
                ),
              S.listItem()
                .title("Drafts")
                .child(
                  S.documentTypeList("article").filter("published != true"),
                ),
              // Only show sensitive content to admins
              ...(userRole === "admin"
                ? [
                    S.listItem()
                      .title("Sensitive")
                      .child(
                        S.documentTypeList("article").filter(
                          "sensitive == true",
                        ),
                      ),
                  ]
                : []),
            ]),
        );
    },
  },
});
```

## Grouping

Organize documents into logical groups that appear as collapsible sections:

```ts
// Content group
export default defineType({
  name: "page",
  options: {structureGroup: "content"},
});

// Commerce group
export default defineType({
  name: "product",
  options: {structureGroup: "commerce"},
});

// Settings group
export default defineType({
  name: "siteSettings",
  options: {structureGroup: "settings"},
});
```

This creates a structure like:

- **Content** (collapsible group)
  - Pages
- **Commerce** (collapsible group)
  - Products
- **Settings** (collapsible group)
  - Site Settings
- Ungrouped documents (if any)

## License

[MIT](LICENSE) © Tinloof

## Develop & test

This plugin uses [@sanity/plugin-kit](https://github.com/sanity-io/plugin-kit)
with default configuration for build & watch scripts.

See [Testing a plugin in Sanity Studio](https://github.com/sanity-io/plugin-kit#testing-a-plugin-in-sanity-studio)
on how to run this plugin with hotreload in the studio.
