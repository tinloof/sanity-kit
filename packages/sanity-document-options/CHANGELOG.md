# @tinloof/sanity-document-options

## 2.0.1

### Patch Changes

- 2d358f3:
- Updated dependencies [2d358f3]
  - @tinloof/sanity-extends@2.0.1

## 2.0.0

### Major Changes

- abca273: **BREAKING CHANGE**: Updated peer dependencies to require Sanity v5, React 19.2.3+, Next.js 16.0.10+, and next-sanity v12.

  These minimum versions are required due to:
  - Sanity v5 dropping support for React < 19.2
  - next-sanity v12 requiring Next.js 16 and React 19.2
  - Critical security vulnerabilities (CVE-2025-55182, CVE-2025-67779) in earlier versions of React and Next.js

### Patch Changes

- e9b662f: Preserve natural order of structure items instead of pushing ungrouped items to the bottom
- Updated dependencies [abca273]
  - @tinloof/sanity-extends@2.0.0

## 1.3.2

### Patch Changes

- 17e5837: Updated singleton abstract resolver so document actions only target the schema using the abstract, creation context handling, and configurable singleton IDs in structure options

## 1.3.1

### Patch Changes

- cc1b86d:
- Updated dependencies [cc1b86d]
  - @tinloof/sanity-extends@1.2.2

## 1.3.0

### Minor Changes

- 4d7aab9: Add custom document ID support for singleton documents\*\*

  Singletons now accept an optional `id` parameter to customize the document ID instead of defaulting to the schema type name.

  ```ts
  structureOptions: {
    singleton: {
      id: "custom-document-id",
    },
  }
  ```

  This applies to both regular and localized singletons.

## 1.2.3

### Patch Changes

- 6f1a866: Fixed critical publishing issue by migrating package manager from Bun to pnpm. Packages are now published with properly resolved workspace dependencies instead of broken `workspace:*` protocol references, making them installable from npm. Also fixed missing repository metadata and TypeScript errors that were blocking the publish process.

## 1.2.2

### Patch Changes

- 204e4e7: Fixed publishing issue where packages were published with unresolved `workspace:*` protocol references, making them uninstallable from npm. Workspace dependencies are now properly resolved to actual version numbers during the publish process.

## 1.2.1

### Patch Changes

- 0fb1b20: Update dependencies to latest versions
  - Update Sanity packages to latest stable versions
  - Update Next.js and React dependencies
  - Update TypeScript and build tooling dependencies
  - Fix component type definitions for improved TypeScript compatibility
  - Remove deprecated eslint configuration

- Updated dependencies [0fb1b20]
  - @tinloof/sanity-extends@1.2.1

## 1.2.0

### Minor Changes

- 1bd5f99: Update @tinloof/sanity-extends utilities

### Patch Changes

- Updated dependencies [67eece5]
- Updated dependencies [c49739c]
  - @tinloof/sanity-extends@1.2.0

## 1.1.0

### Minor Changes

- c7491b3: Add orderable abstract

### Patch Changes

- 51862a9: Removed fields from the abstract schemas
- Updated dependencies [517151b]
- Updated dependencies [2961a35]
- Updated dependencies [c7491b3]
- Updated dependencies [629c182]
- Updated dependencies [51862a9]
  - @tinloof/sanity-extends@1.1.0

## 1.0.0

### Major Changes

- 6f19a78: Configure document actions, badges, templates, and structure directly in your schema definitions.
