# Standalone translation release candidate

The selected implementation is `@tinloof/sanity-document-i18n`. The candidate preserves content locale fields and metadata references whose `_key` is the locale ID. No `language` field or schema migration is included. The approved peer range is `^6.12.0`, with exact Sanity 6.13.1 development dependencies. Builds, types, the 53-test suite, packaged consumer checks and authenticated standard translation checks pass on that graph. Completed Sanity 6.12 QA remains in [live findings and cleanup status](i18n-live-findings.md).

## Completed locally

Current 6.13.1 checks and historical integration coverage are distinguished in [the release review](README.md).

| Work | Evidence |
| --- | --- |
| Existing-format regression coverage | 53 tests cover reference creation, old metadata navigation and previews, nested exclusions, falsy excluded values, creation transactions, custom locale fields, weak references, callback failures, retry after rejected writes, two-step deletion, delete-all transactions, publication reference patches, duplication, and permission/metadata guards. |
| Field exclusion fix | Excluded `false`, `0`, empty-string, and `null` values are now removed from new translations. Source documents are preserved. |
| Duplication error fix | Content operation and direct metadata transaction errors now report failure and reset the action instead of leaving it pending indefinitely. |
| Types and build | Source and test types pass. ESM, CommonJS, and declarations build successfully. |
| Browser fixture | Chromium, Firefox, and WebKit pass creation, navigation through existing locale keys, and duplication failure recovery with actual Sanity UI 4 styles and controls. Host hooks and client writes use local fixtures. All external requests, including the UI font request, were blocked. No page errors occurred. |
| Package artifact | The local tarball contains only distribution files, the manifest, and README. Its ESM and CommonJS entry points load and register the plugin on Node 22.12.0. That minimum Node release emits its expected experimental warning for CommonJS loading ESM dependencies. |
| Release notes | A standalone major changeset is drafted. The README now names the correct `localeField` option and explains compatibility and configuration ownership. Package versions remain unchanged. |

The regression suite uses real Sanity schema compilation, patch/transaction builders, and local mutation application for field exclusion. React hooks run in jsdom; Sanity host state and the client's mutation method are replaced. These checks do not establish Content Lake authorization, transaction acceptance, or authenticated Studio integration.

## Standard integration implemented

The normal localized content action resolver installs translation-group duplication and reference-aware deletion. It preserves earlier action removals and disabled states and leaves release-version actions unchanged. Group duplication creates metadata through a client transaction rather than opening an unregistered metadata editor. Published translations strengthen their references using revision-guarded patches unless weak references are configured.

Deletion waits for a successful reference query, unlinks entries that point to the selected document with a metadata revision guard, and then requires a separate confirmation to delete. A stale locale field cannot unlink another document's translation. The 53-test suite includes loading/error guards, stale locale values, concurrent revision failures, preserved action restrictions, and release-version exclusions.

## Live acceptance

The first authenticated Arc run on project `rnkfj9jg`, dataset `production`, passed creation, locale-keyed metadata, navigation, editing, and publication with distinct URLs. Sanity 6.13.0 failed shared-pathname publication before the helper fix. The subsequent Sanity 6.12 candidate passed shared-pathname publication, reference strengthening, group duplication and same-locale collision rejection in the authenticated Studio. The corrected helper now passes isolated 6.13.1 tests and browser fixtures; authenticated standard-Studio acceptance on the new complete graph remains pending.

Live unlinking, draft/published deletion, stale-revision rejection, partial duplication failure and retry all passed. All translation QA records and the temporary preview secret were cleaned up. See [live findings](i18n-live-findings.md) for evidence and the original-document baseline.

Duplication uses several Sanity operations. A failure can leave newly created draft copies behind. It preserves original documents but does not roll back successful copies; the live check confirmed retry after repairing the failed reference and explicit cleanup of partial copies. Bulk publishing and the metadata editor remain disabled and are not claimed as release features.

The [deprecated wrapper removal](deprecated-wrapper-follow-up.md) is now implemented with migration guidance and a Studio major changeset. No downstream repository or stored data was migrated.

## Reproduce

Use the repository's Node 24.18.0 and pnpm 12.3.4 pins:

1. `pnpm install --frozen-lockfile`
2. `pnpm --filter @tinloof/sanity-extends build`
3. `pnpm --filter @tinloof/sanity-document-i18n test`
4. `pnpm --filter @tinloof/sanity-document-i18n typecheck`
5. `pnpm --filter @tinloof/sanity-document-i18n build`
6. `pnpm --filter @tinloof/sanity-document-i18n pack --pack-destination /tmp/sanity-i18n-review`

Local logs, packed files, and the isolated browser fixture are under `/private/tmp/sanity-kit-dependency-audit/`, with filenames beginning `i18n-`. The browser fixture is diagnostic tooling, not an authenticated Studio or a shipped example.

No code has been committed, pushed, or merged; no package has been published. The QA content was published to the selected test project. No schema was deployed or migrated.
