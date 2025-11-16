---
"@tinloof/sanity-studio": minor
---

Enhanced documentI18n plugin with comprehensive functionality and new localizedAbstract

- Added automatic schema detection for translatable documents (supports locale field, options.localized, and extends "localized")
- Improved template filtering to prevent creation of localeless documents for translatable schemas
- Enhanced metadata filtering to hide translation.metadata from user-facing document creation menus
- Added localizedAbstract export - a built-in abstract schema for easy document internationalization
- Added comprehensive JSDoc documentation with examples
- Extended TypeScript declarations for DocumentOptions.localized property
- Updated extractTranslatableSchemaTypes function to support extends property
