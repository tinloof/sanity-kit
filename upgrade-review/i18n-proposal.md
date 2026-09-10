# Translation compatibility proposal (superseded)

**Decision:** Use `@tinloof/sanity-document-i18n` with its existing metadata format. The deprecated wrapper was initially deferred and is now removed locally as part of the authorized blocker work. The dual-format schema proposal below is not approved and is not part of this release.

Sanity 6 itself does not require every translation dataset to change format. The requirement comes from upgrading the upstream `@sanity/document-internationalization` plugin used by our deprecated `@tinloof/sanity-studio` wrapper. Its last old-format version, 5.1.3, only declares support through Sanity 5.

Our standalone `@tinloof/sanity-document-i18n` is a separate implementation and does not depend on that upstream plugin. Its proposed dual-format support is a compatibility measure, not a blanket requirement to migrate every existing customer dataset.

## Ownership and affected repositories

- Project developers configure locales and enable the plugin in `sanity.config.ts`.
- We maintain the plugin's internal metadata schema, readers, and writers.
- Translation relationships are stored as `translation.metadata` documents in each project's Sanity dataset, separate from the content documents' `locale` fields.
- The owner of a project adopting upstream version 6 must review its queries and run the required dataset migration. Publishing this package does not migrate anyone's data.
- Under this proposal, projects staying on our standalone plugin can continue reading old metadata without a mandatory migration. Custom queries need review if independent-key writers are introduced.
- The active i18n configurations found in this repository use the standalone plugin. Other Tinloof/client repositories have not been inspected, so their migration needs are not yet established.

## Proposed local changes

1. Add an optional `language` string to our translation reference schema and public `TranslationReference` type.
2. Read a reference locale as `language ?? _key` everywhere it denotes a locale. Continue using the actual `_key` for array identity and patch paths.
3. New references written by our custom plugin and localized singleton helper contain both `language: localeId` and `_key: localeId`. Existing consumers that read locale from `_key` keep working with these references.
4. Provide a narrowly scoped migration for `translation.metadata`: fill missing `language` from the old `_key`, preserving keys, references, IDs and existing language values. Include offline fixtures and repeat-run checks. Do not execute it against a remote dataset.
5. The deprecated upstream wrapper requires this migration before use with existing old-format data. Document that requirement explicitly in its major release. Our custom plugin reads old, new and mixed data without requiring migration.
6. References created by upstream 6 use random keys. Downstream custom queries that interpret `_key` as a locale must adopt `coalesce(language, _key)` before those writers are enabled. Restoring old package versions alone is not a complete rollback for upstream-written data.

## Verification before release

Old/new/mixed fixtures, locale selection, duplicate/delete patch paths, reference strengthening, localized singletons and migration idempotence. Real write tests require a disposable dataset. The published package remains unreleased until that check and migration guidance are reviewed.

## Alternative

Retain the deprecated wrapper and its old dependency unchanged, withhold its Sanity 6 release, and release only independently verified packages. This avoids a schema change now but does not achieve a complete Sanity 6 update.
