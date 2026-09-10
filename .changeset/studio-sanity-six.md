---
"@tinloof/sanity-studio": major
---

Require Sanity 6.12 or later within major 6 (`^6.12.0`) and drop Sanity 5 support. Update Studio integrations for Sanity UI 4, Sanity icons 5, and React 19.2.4 or later within major 19. Require Node.js 22.12 or later.

Remove the deprecated `documentI18n` wrapper, its `SanityI18NPluginOptions` type, and the dependency on `@sanity/document-internationalization`. Import `documentI18n` from `@tinloof/sanity-document-i18n`, remove the wrapper-only `schemas` option, and retain the existing locale IDs and locale field. Review stored metadata before switching from a different plugin format; this release does not migrate content.

Update UI imports, schema option types, ESM-compatible imports, and distribution exports for the new toolchain. Published exports resolve built files rather than workspace source files.

Initialize `definePathname` validation after the field options are available, preserving locale-aware and caller-provided uniqueness checks on Sanity 6.13. This uses the public validation API, preserves supplied validation rules, and does not change stored content. Earlier-version compatibility is regression-tested. The fix is scoped to this helper; it does not patch arbitrary slug schemas inside the consuming Studio. Named slug aliases and caller-supplied compiled Rule objects can still encounter Sanity's upstream regression.
