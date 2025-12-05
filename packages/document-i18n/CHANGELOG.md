# @tinloof/sanity-document-i18n

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
     import {documentI18n} from "@tinloof/sanity-studio";

     // NEW (recommended)
     import {documentI18n} from "@tinloof/sanity-document-i18n";
     ```

  3. Update your configuration:
     ```typescript
     export default defineConfig({
       plugins: [
         documentI18n({
           locales: [
             {id: "en", title: "English"},
             {id: "fr", title: "French"},
           ],
         }),
       ],
     });
     ```
