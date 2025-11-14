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
  })

  const landingPage = defineType({
    type: "document",
    name: "landingPage",
    title: "Landing Page",
    extends: "page",
    fields: [{name: "hero", type: "text"}],
  })

  const homePage = defineType({
    type: "document",
    name: "homePage",
    title: "Home Page",
    extends: "landingPage",
    fields: [{name: "featured", type: "string"}],
  })
]

export default defineConfig({
  schema: {types: withExtends([page, landingPage, homePage])},
});
```

In this example:

- `page` is an abstract type with reusable fields
- `landingPage` document extends the `page` abstract
- `homePage` document extends `landingPage`, inheriting its fields and creating an extension chain
- Abstract types don't create documents—they only serve as field templates

## Features

- Define reusable fields, groups and any schema options using abstract types
- Extend documents and abstracts from one or multiple types
- Support for extension chains (type → type → type)
- Automatic circular dependency detection
- Field merging from base types

## License

ISC
