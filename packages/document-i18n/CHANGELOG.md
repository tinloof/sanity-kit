# @tinloof/sanity-document-i18n

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

- Updated dependencies [abca273]
  - @tinloof/sanity-extends@2.0.0

## 1.1.4

### Patch Changes

- cc1b86d:
- Updated dependencies [cc1b86d]
  - @tinloof/sanity-extends@1.2.2

## 1.1.3

### Patch Changes

- 6f1a866: Fixed critical publishing issue by migrating package manager from Bun to pnpm. Packages are now published with properly resolved workspace dependencies instead of broken `workspace:*` protocol references, making them installable from npm. Also fixed missing repository metadata and TypeScript errors that were blocking the publish process.

## 1.1.2

### Patch Changes

- 204e4e7: Fixed publishing issue where packages were published with unresolved `workspace:*` protocol references, making them uninstallable from npm. Workspace dependencies are now properly resolved to actual version numbers during the publish process.

## 1.1.1

### Patch Changes

- 0fb1b20: Update dependencies to latest versions
  - Update Sanity packages to latest stable versions
  - Update Next.js and React dependencies
  - Update TypeScript and build tooling dependencies
  - Fix component type definitions for improved TypeScript compatibility
  - Remove deprecated eslint configuration

- Updated dependencies [0fb1b20]
  - @tinloof/sanity-extends@1.2.1

## 1.1.0

### Minor Changes

- db1c824: Add i18n abstract for standardized internationalization fields
  - Introduces an i18n abstract that is automatically injected by default
  - Provides a consistent way to organize i18n-related fields across schemas
  - Requires the `@tinloof/sanity-extends` plugin for abstract support
  - Can be disabled by setting `abstracts: false` in the plugin configuration
  - Type-safe configuration using keys from the ABSTRACTS_MAP for automatic type inference

## 1.0.0

### Major Changes

- fb4ac21: Fork of the Sanity i18n with better defaults and seperating it to a seperate package

  BREAKING: Deprecate documentI18n plugin in favor of @tinloof/sanity-document-i18n

  The `documentI18n` plugin has been moved to a separate package `@tinloof/sanity-document-i18n` with enhanced features and better template management.

  **Migration required:**
  1. Install the new package:

     ```bash
     npm install @tinloof/sanity-document-i18n
     ```

  2. Update your imports:

     ```typescript
     // OLD (deprecated)
     import { documentI18n } from "@tinloof/sanity-studio";

     // NEW (recommended)
     import { documentI18n } from "@tinloof/sanity-document-i18n";
     ```

  3. Update your configuration:
     ```typescript
     export default defineConfig({
       plugins: [
         documentI18n({
           locales: [
             { id: "en", title: "English" },
             { id: "fr", title: "French" },
           ],
         }),
       ],
     });
     ```
