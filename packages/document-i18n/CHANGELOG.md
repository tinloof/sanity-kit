# @tinloof/sanity-document-i18n

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
