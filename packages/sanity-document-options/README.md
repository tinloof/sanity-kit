# @tinloof/sanity-document-options

Configure document actions, badges, templates, and structure directly in your schema definitions.

## Installation

```sh
npm install @tinloof/sanity-document-options
```

## Basic Setup

Add the plugin to your `sanity.config.ts`:

```ts
import {defineConfig} from "sanity";
import {documentOptions} from "@tinloof/sanity-document-options";

export default defineConfig({
  plugins: [documentOptions()],
});
```

### Disable Structure Tool

If you want to use only document options (actions, badges, templates) without the structure tool:

```ts
export default defineConfig({
  plugins: [documentOptions({structure: false})],
});
```

## Features

### ✅ Zero Configuration

Works out of the box - automatically creates structure from your schemas.

### ✅ Document Actions & Badges

Configure actions and badges directly in schema options.

### ✅ Document Templates

Define initial value templates in schemas.

### ✅ Structure Options

Control how documents appear in the studio structure.

### ✅ Grouping & Organization

Organize documents into collapsible groups.

### ✅ Singletons & Ordering

Create single-instance documents or enable drag-and-drop ordering.

### ✅ Localization Support

Multi-language content with locale-specific views.

## Usage Examples

### Document Actions

```ts
defineType({
  name: "post",
  type: "document",
  options: {
    document: {
      actions: (prev, context) => {
        // Remove delete for published posts
        if (context.published) {
          return prev.filter((action) => action.action !== "delete");
        }
        return prev;
      },
    },
  },
});
```

### Document Badges

```ts
defineType({
  name: "article",
  type: "document",
  options: {
    document: {
      badges: (prev, context) =>
        [
          ...prev,
          context.published && {
            label: "Published",
            color: "success",
          },
        ].filter(Boolean),
    },
  },
});
```

### Document Templates

```ts
defineType({
  name: "page",
  type: "document",
  options: {
    schema: {
      templates: [
        {
          id: "page-blog",
          title: "Blog Post",
          schemaType: "page",
          value: {category: "blog"},
        },
      ],
    },
  },
});
```

### Structure Groups

```ts
defineType({
  name: "settings",
  type: "document",
  options: {
    structureGroup: "configuration",
  },
});
```

### Singleton Documents

```ts
defineType({
  name: "homePage",
  type: "document",
  options: {
    structureGroup: "pages",
    structureOptions: {
      singleton: true,
      icon: HomeIcon,
      title: "Home Page",
    },
  },
});
```

### Singleton Documents with Custom ID

By default, singleton documents use the schema type name as their document ID. You can specify a custom ID for more control:

```ts
defineType({
  name: "homePage",
  type: "document",
  options: {
    structureGroup: "pages",
    structureOptions: {
      singleton: {
        id: "site-home-page",
      },
      icon: HomeIcon,
      title: "Home Page",
    },
  },
});
```

This is useful when:
- You need predictable document IDs for API queries
- You're migrating from another system with existing IDs
- You want human-readable IDs in URLs

### Orderable Documents

```ts
defineType({
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

```ts
// Plugin configuration
documentOptions({
  structure: {
    locales: [
      {id: "en", title: "English"},
      {id: "fr", title: "French"},
    ],
  },
});

// Schema configuration
defineType({
  name: "article",
  type: "document",
  options: {
    localized: true,
  },
  fields: [
    {name: "locale", type: "string", hidden: true},
    // ... other fields
  ],
});
```

### Custom Structure Builder

```ts
defineType({
  name: "product",
  type: "document",
  options: {
    structureGroup: "commerce",
    structureOptions: (S, context) =>
      S.listItem()
        .title("Products by Category")
        .child(
          S.list()
            .title("Categories")
            .items([
              S.listItem()
                .title("Electronics")
                .child(
                  S.documentTypeList("product").filter(
                    'category == "electronics"',
                  ),
                ),
            ]),
        ),
  },
});
```

## Plugin Options

```ts
documentOptions({
  structure?: {
    locales?: Locale[];        // Locale configuration
    hide?: string[];           // Document types to hide
    toolTitle?: string;        // Structure tool title
    localeFieldName?: string;  // Locale field name (default: "locale")
  } | false,                   // Pass false to disable structure tool
});
```

## Schema Options

```ts
interface DocumentOptions {
  // Structure configuration
  structureGroup?: string;
  structureOptions?:
    | StructureBuiltinOptions
    | ((
        S: StructureBuilder,
        context: StructureResolverContext,
      ) => ListItemBuilder);
  localized?: boolean;

  // Document options
  document?: {
    actions?: (prev, context) => DocumentActionComponent[];
    badges?: (prev, context) => DocumentBadgeComponent[];
    newDocumentOptions?: (prev, context) => TemplateItem[];
  };

  // Schema options
  schema?: {
    templates?: Template[] | ((prev, context) => Template[]);
  };
}
```

## Built-in Structure Options

```ts
type StructureBuiltinOptions = {
  singleton?: boolean | { id?: string };
  orderable?: boolean;
  icon?: React.ComponentType | React.ReactNode;
  title?: string;
  views?: (S: StructureBuilder) => (View | ViewBuilder)[];
};
```

## License

[MIT](LICENSE) © Tinloof
