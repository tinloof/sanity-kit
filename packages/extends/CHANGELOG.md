# @tinloof/sanity-extends

## 1.2.0

### Minor Changes

- 67eece5: New Features
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

- c49739c: Add `CreateAbstractsConfig` utility type for generating abstracts configuration objects

  This helper type simplifies creating configuration types that allow disabling all abstracts or selectively enabling/disabling specific document types. Useful when building reusable schema packages or plugins that need flexible abstract type configuration.

  Example:

  ```ts
  type MyAbstracts = CreateAbstractsConfig<"page" | "article" | "product">;
  // Result: false | { page?: boolean; article?: boolean; product?: boolean }
  ```

## 1.1.0

### Minor Changes

- 517151b: Fix field merging to correctly handle duplicate field names: child fields now override all parent fields with the same name while preserving duplicates within the same schema
- 2961a35: Add abstract resolvers
- c7491b3: Export the ExtendedAbstract type for use in other packages
- 51862a9: Replace defineAbstract with defineAbstractResolver, and fix type issues

### Patch Changes

- 629c182: Fix return type

## 1.0.1

### Patch Changes

- 0589b51: Fix module import in package.json

## 1.0.0

### Major Changes

- d94e7be: V1 of the sanity-extend utility
