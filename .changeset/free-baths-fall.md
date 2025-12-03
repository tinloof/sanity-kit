---
"@tinloof/sanity-document-i18n": minor
---

Add i18n abstract for standardized internationalization fields

- Introduces an i18n abstract that is automatically injected by default
- Provides a consistent way to organize i18n-related fields across schemas
- Requires the `@tinloof/sanity-extends` plugin for abstract support
- Can be disabled by setting `abstracts: false` in the plugin configuration
- Type-safe configuration using keys from the ABSTRACTS_MAP for automatic type inference
