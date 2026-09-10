---
"@tinloof/sanity-document-i18n": major
---

Require Sanity 6.12 or later within major 6 (`^6.12.0`) and drop Sanity 5 support. Update integrations for Sanity UI 4 and Sanity icons 5. Require React and React DOM 19.2.4 or later within major 19. Sanity requires Node.js 22.12 or later.

For shared translated pathnames, the updated `definePathname` helper in `@tinloof/sanity-studio` preserves custom uniqueness on Sanity 6.13. Raw consumer slug schemas, including named aliases and precompiled validation rules, remain subject to the upstream slug-validation regression and need separate validation. The translation plugin does not patch Sanity internals.

Preserve the standalone plugin's content locale field and locale-keyed translation metadata. Existing standalone-plugin data needs no migration; keep the same locale IDs and `localeField` configuration.

Wire translation duplication and deletion into ordinary localized document actions while preserving action restrictions and leaving release-version actions unchanged. Create copied metadata directly without requiring a metadata editor schema. Strengthen published translation references with revision guards. Unlink only references to the selected document before a separately confirmed deletion, and block deletion while reference checks are loading or have failed.

Honor field exclusions for `false`, `0`, empty strings, and `null`. Report duplication failures and re-enable the action. Duplication uses multiple operations; a failed attempt can leave newly created draft copies and does not roll them back. Bulk publishing remains disabled.
