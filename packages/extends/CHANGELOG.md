# @tinloof/sanity-extends

## 2.0.2

### Patch Changes

- fa232b4: Update lodash to ^4.17.23 to address security vulnerability
- dd30b32:

## 2.0.1

### Patch Changes

- 2d358f3:

## 2.0.0

### Major Changes

- abca273: **BREAKING CHANGE**: Updated peer dependencies to require Sanity v5, React 19.2.3+, Next.js 16.0.10+, and next-sanity v12.

  These minimum versions are required due to:
  - Sanity v5 dropping support for React < 19.2
  - next-sanity v12 requiring Next.js 16 and React 19.2
  - Critical security vulnerabilities (CVE-2025-55182, CVE-2025-67779) in earlier versions of React and Next.js

## 1.2.2

### Patch Changes

- cc1b86d:

## 1.2.1

### Patch Changes

- 0fb1b20: Update dependencies to latest versions
  - Update Sanity packages to latest stable versions
  - Update Next.js and React dependencies
  - Update TypeScript and build tooling dependencies
  - Fix component type definitions for improved TypeScript compatibility
  - Remove deprecated eslint configuration

## 1.2.0

### Minor Changes

- 67eece5: New Features
  - **`defineAbstractResolver`** - Renamed from `defineAbstract` for clarity. Resolvers now accept an optional `options` parameter for parameterized abstracts.
  - **Parameterized extends** - Support for passing parameters to abstract resolvers using object syntax: `extends: { type: "sluggable", parameters: { source: "title" } }`
  - **`ExtendsRegistry`** - New interface for type-safe autocomplete. Augment it to get strict typing for your abstract resolvers:

    ```ts
    declare module "@tinloof/sanity-extends" {
      interface ExtendsRegistry {
        sluggable: { source: string };
        seo: { defaultTitle?: string };
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
