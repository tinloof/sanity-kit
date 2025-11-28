# @tinloof/sanity-extends

Schema extension utilities for Sanity CMS that allow you to define reusable schema types and extend them across your documents.

## Installation

```bash
pnpm add @tinloof/sanity-extends
```

## Setup

In your Sanity config, wrap your schema types with `withExtends`:

```typescript
import {withExtends} from "@tinloof/sanity-extends";
import {defineConfig} from "sanity";

export default defineConfig({
  schema: {
    types: withExtends([
      // Your schema types here
    ]),
  },
});
```

## Abstract Types and Extending

### What are Abstract Types?

Abstract types are a special subset of Sanity document types that are designed to be extended rather than used directly. They don't create documents in Sanity—instead, they serve as reusable templates for documents. Abstract types are defined with `type: 'abstract'` and are meant to be inherited by other abstract types or document types using the `extends` option.

### The `extends` Option

The `extends` option lets documents and abstract types inherit fields from other types. It accepts:

- **Single type**: `extends: 'seo'`
- **Multiple types**: `extends: ['seo', 'timestamps']`
- **Parameterized type**: `extends: { type: 'sluggable', parameters: { source: 'name' } }`
- **Mixed array**: `extends: ['seo', { type: 'sluggable', parameters: { source: 'title' } }]`
- **Type chains**: A type can extend another type that also extends types

### How It Works

When you define an abstract type with reusable fields, other documents and abstracts can inherit those fields by using the `extends` option. The fields from the base type are automatically merged into the extending type:

```typescript
import {defineType} from "sanity";

const page = defineType({
  type: "abstract",
  name: "page",
  fields: [
    {name: "title", type: "string"},
    {name: "slug", type: "string"},
  ],
});

const landingPage = defineType({
  type: "document",
  name: "landingPage",
  title: "Landing Page",
  extends: "page",
  fields: [{name: "hero", type: "text"}],
});

const homePage = defineType({
  type: "document",
  name: "homePage",
  title: "Home Page",
  extends: "landingPage",
  fields: [{name: "featured", type: "string"}],
});

export default defineConfig({
  schema: {types: withExtends([page, landingPage, homePage])},
});
```

In this example:

- `page` is an abstract type with reusable fields
- `landingPage` document extends the `page` abstract
- `homePage` document extends `landingPage`, inheriting its fields and creating an extension chain
- Abstract types don't create documents—they only serve as field templates

## Abstract Resolvers

Abstract resolvers are functions that generate abstract types dynamically based on the extending document. Use `defineAbstractResolver` to create one:

```typescript
import {defineAbstractResolver, withExtends} from "@tinloof/sanity-extends";

const seoFields = defineAbstractResolver((doc) => ({
  type: "abstract",
  name: "seoFields",
  fields: [
    {name: `${doc.name}MetaTitle`, type: "string"},
    {name: `${doc.name}MetaDescription`, type: "text"},
  ],
}));

const article = defineType({
  type: "document",
  name: "article",
  extends: "seoFields",
  fields: [{name: "title", type: "string"}],
});

// article will have: title, articleMetaTitle, articleMetaDescription
```

The resolver receives the full document definition, so you can generate field names, conditionally include fields, or create dynamic fieldsets based on the document's properties.

In extension chains, resolvers always receive the **root document** (the final document), not intermediate abstracts.

### Parameterized Abstract Resolvers

Abstract resolvers can accept an optional `options` parameter, allowing you to customize the generated fields per document:

```typescript
import {defineAbstractResolver, withExtends} from "@tinloof/sanity-extends";

const sluggable = defineAbstractResolver((doc, options) => ({
  type: "abstract",
  name: "sluggable",
  fields: [
    {
      name: "slug",
      type: "slug",
      options: {
        source: options?.source ?? "title",
        maxLength: options?.maxLength ?? 96,
      },
    },
  ],
}));

const article = defineType({
  type: "document",
  name: "article",
  extends: {type: "sluggable", parameters: {source: "headline"}},
  fields: [{name: "headline", type: "string"}],
});

const author = defineType({
  type: "document",
  name: "author",
  extends: {type: "sluggable", parameters: {source: "name", maxLength: 50}},
  fields: [{name: "name", type: "string"}],
});
```

## Type-Safe Extends with `ExtendsRegistry`

For better TypeScript autocomplete when using parameterized extends, you can augment the `ExtendsRegistry` interface:

```typescript
// In a .d.ts file or at the top of your schema file
declare module "@tinloof/sanity-extends" {
  interface ExtendsRegistry {
    // Required parameters: at least one required key makes `parameters` required
    sluggable: {source: string; maxLength?: number};

    // Optional parameters: all keys optional means `parameters` is optional
    seo: {defaultTitle?: string};

    // No parameters: use `undefined` to disallow parameters entirely
    publishable: undefined;
  }
}
```

The type system automatically determines whether `parameters` is required:

- **Required parameters** — If any key is required (e.g., `source: string`), you must provide `parameters`
- **Optional parameters** — If all keys are optional (e.g., `defaultTitle?: string`), `parameters` is optional
- **No parameters** — Use `undefined` to indicate the abstract takes no parameters

Once declared, you'll get autocomplete and type checking for the `extends` option:

```typescript
// sluggable: parameters required (has required `source` key)
const article = defineType({
  type: "document",
  name: "article",
  extends: {type: "sluggable", parameters: {source: "title"}}, // ✓ OK
  fields: [{name: "title", type: "string"}],
});

// seo: parameters optional (all keys are optional)
const page = defineType({
  type: "document",
  name: "page",
  extends: {type: "seo"}, // ✓ OK - parameters not required
  fields: [{name: "title", type: "string"}],
});

// publishable: no parameters allowed
const post = defineType({
  type: "document",
  name: "post",
  extends: {type: "publishable"}, // ✓ OK
  // extends: {type: "publishable", parameters: {}}, // ✗ Error
  fields: [{name: "title", type: "string"}],
});

// String syntax also gets autocomplete for registered names
const author = defineType({
  type: "document",
  name: "author",
  extends: "publishable", // ✓ Autocomplete suggests: "sluggable", "seo", "publishable"
  fields: [{name: "name", type: "string"}],
});
```

## Utility: `resolveAbstractSchemaTypes`

When building reusable schema packages or plugins, use `resolveAbstractSchemaTypes` to let users enable/disable specific abstracts via configuration:

```typescript
import {
  resolveAbstractSchemaTypes,
  defineAbstractResolver,
  withExtends,
  type ExtendedType,
} from "@tinloof/sanity-extends";

// Define your abstract resolvers
const seoAbstract = defineAbstractResolver((doc) => ({
  type: "abstract",
  name: "seo",
  fields: [
    {name: "metaTitle", type: "string"},
    {name: "metaDescription", type: "text"},
  ],
}));

const publishableAbstract = defineAbstractResolver((doc) => ({
  type: "abstract",
  name: "publishable",
  fields: [
    {name: "publishedAt", type: "datetime"},
    {name: "status", type: "string"},
  ],
}));

// Create a map of available abstracts
const abstractSchemaMap = {
  seo: seoAbstract,
  publishable: publishableAbstract,
} as const;

// User configuration
type AbstractsConfig = Partial<Record<keyof typeof abstractSchemaMap, boolean>>;

// Plugin or schema factory function
export function createSchemaTypes(config: {
  abstracts?: AbstractsConfig | false;
}) {
  const enabledAbstracts = resolveAbstractSchemaTypes(
    abstractSchemaMap,
    config.abstracts ?? {seo: true, publishable: true}, // defaults
  );

  return withExtends([
    ...enabledAbstracts,
    // ... your document types
  ]);
}

// Usage
export default defineConfig({
  schema: {
    types: createSchemaTypes({
      abstracts: {
        seo: true,
        publishable: false, // Disable publishable
      },
    }),
  },
});
```

### Passing Global Options to Resolvers

You can pass global options that will be merged into all resolver calls:

```typescript
const enabledAbstracts = resolveAbstractSchemaTypes(
  abstractSchemaMap,
  {seo: true, publishable: true},
  {apiVersion: "2024-01-01", projectId: "abc123"}, // Global options
);
```

### Disabling All Abstracts

Pass `false` to disable all abstracts:

```typescript
const types = resolveAbstractSchemaTypes(abstractSchemaMap, false);
// Returns: []
```

## API Reference

### `withExtends(types: ExtendedType[])`

Wraps schema types and resolves all extensions. Use this in your Sanity config's `schema.types`.

### `defineAbstractResolver(resolver: AbstractDefinitionResolver)`

Helper function to define an abstract resolver with proper typing.

```typescript
type AbstractDefinitionResolver = (
  document: DocumentDefinition,
  options?: object | boolean,
) => AbstractDefinition;
```

### `resolveAbstractSchemaTypes(abstractSchemaMap, abstracts, options?)`

Utility for resolving which abstract types to enable based on configuration.

- `abstractSchemaMap`: Object mapping keys to abstract types or resolvers
- `abstracts`: Object with boolean values to enable/disable each abstract, or `false` to disable all
- `options`: Optional global options passed to all resolvers

### Types

```typescript
// Abstract schema definition
type AbstractDefinition = Omit<DocumentDefinition, "type" | "fields"> & {
  type: "abstract";
  fields?: FieldDefinition[];
};

// Function that resolves an abstract based on document context
type AbstractDefinitionResolver = (
  document: DocumentDefinition,
  options?: object | boolean,
) => AbstractDefinition;

// Union of schema types and resolvers
type ExtendedType = SchemaTypeDefinition | AbstractDefinitionResolver;
```

## Features

- Define reusable fields, groups and any schema options using abstract types
- Extend documents and abstracts from one or multiple types
- Support for extension chains (type → type → type)
- Parameterized extends for customizable abstract resolvers
- Type-safe autocomplete via `ExtendsRegistry` augmentation
- `resolveAbstractSchemaTypes` utility for building configurable schema packages
- Automatic circular dependency detection
- Field merging from base types

## License

ISC
