# Deprecated wrapper removal

Implemented locally for the `@tinloof/sanity-studio` 3.0.0 candidate. The export, its public options type, and `@sanity/document-internationalization` dependency are removed. All in-repository Studio consumers already import the standalone package. The installed workspace now passes `pnpm peers check` with no peer issues.

[Consumer migration guidance](../apps/docs/content/docs/sanity-studio/document-i18n-deprecated.mdx) explains the import, removal of `schemas`, configuration ownership, and stored-data checks. A Studio major changeset records the breaking removal.

No downstream repository was changed or comprehensively inventoried. Before updating one, check wrapper imports, custom metadata readers, locale settings, and its stored metadata format. Existing standalone data remains compatible; this is not a claim that arbitrary upstream-plugin data can be switched without review. No automatic dataset migration is included.
