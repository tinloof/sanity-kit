---
"@tinloof/sanity-extends": minor
---

New Features

- **`defineAbstractResolver`** - Renamed from `defineAbstract` for clarity. Resolvers now accept an optional `options` parameter for parameterized abstracts.

- **Parameterized extends** - Support for passing parameters to abstract resolvers using object syntax: `extends: { type: "sluggable", parameters: { source: "title" } }`

- **`ExtendsRegistry`** - New interface for type-safe autocomplete. Augment it to get strict typing for your abstract resolvers:

  ```ts
  declare module "@tinloof/sanity-extends" {
    interface ExtendsRegistry {
      sluggable: {source: string};
      seo: {defaultTitle?: string};
      publishable: undefined;
    }
  }
  ```

- **`resolveAbstractSchemaTypes`** - New utility for building configurable schema packages. Allows enabling/disabling abstracts via configuration.

### Internal

- Refactored from single file to modular structure (`src/` directory)
- Added comprehensive tests for new functionality
