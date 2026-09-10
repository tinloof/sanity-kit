# Independent release review

September 10, 2026. Read-only review of the dirty `main-2` candidate against `827d503947017f4099bc8897829e557f86ed8f45`. No source or remote state was changed by the reviewer.

**Current verdict: the duplication restriction and media deletion fixes are independently rechecked; no unresolved introduced regression was found within this review. The coordinator completed the remaining live acceptance checks and cleanup.** No P0 or P1 issue was found within this bounded review. This is not release approval.

## Original finding, now resolved

**P2: Translation-group duplication bypasses document-specific action restrictions.**

In `packages/document-i18n/src/plugin.tsx:164`, the resolver adds `DuplicateWithTranslationsAction` whenever the previous action component is marked `duplicate`. It does not preserve that component returning `null` or a descriptor with `disabled: true`.

A project can therefore hide or disable ordinary duplication for a locked document while the new group action remains available, provided translation metadata exists and Sanity permissions allow the underlying operation. This bypasses the project's UI restriction, not Sanity's server authorization.

Automatic action registration introduces this behavior in the candidate. Before the correction, the release notes overstated preservation of action restrictions. The deletion wrapper already preserves the original descriptor's hidden and disabled states; duplication should do the same.

The reviewer executed the current built plugin under Node 24 with a real Sanity schema and two original duplicate components, one disabled and one returning `null`. Both resolutions returned the original component plus the unwrapped group action. Existing resolver tests cover removal from the action array but omit these descriptor states.

The correction wraps the added group action, calls both components before checking results to preserve hook order, returns null when either is hidden, and combines their disabled states. The independent reviewer rechecked it and reported the P2 resolved with no new finding.

Validation on September 10: all 53 i18n tests pass, including hidden, locked-to-unlocked, and denied-permission cases; source/test type checks, formatting, ESM/CommonJS/declaration builds, and repacking pass. Chromium, Firefox and WebKit verify the actual resolver and action with fixture Sanity services: hidden/disabled/enabled states, creation, navigation, and rejected-write recovery all pass without page errors. No fixture request was permitted to reach Content Lake. Evidence: `/private/tmp/sanity-kit-dependency-audit/review-fix-{tests,types,build,pack,browser}.log`.

## Scope and limits

The reviewer inspected translation mutations and strengthening, the new i18n tests, all seven changesets and release notes, package peers and exports, Next live/cache integration, CI/release workflows, high-risk Studio/options changes, and media changes with whitespace ignored. No other substantive introduced regression was found in that scope. Existing non-atomic duplication and cached-404 limitations are documented accurately.

The coordinator separately confirmed the saved build, type-check, test, peer, version-rehearsal and live-update logs exist, and that the R2 post-test snapshot exactly matches its 81-object baseline. Those checks validate the recorded evidence; they are not fresh full-suite executions.

Translation deletion, real stale-revision rejection, partial duplication failure/retry, authenticated preview and translation cleanup subsequently passed. Offline content retention and recovery after reload passed in three browsers, with the narrowly investigated WebKit unload diagnostic described in the live findings. Studio media upload/metadata/selection, live reference protection and final cleanup also passed. Remote CI, registry authentication and publication have not been exercised. Nothing has been committed, pushed, merged or package-published.

## Media deletion correction

Live QA exposed a pre-existing storage-first deletion sequence that could remove an R2 file before Content Lake rejected deletion of its referenced asset. The correction commits asset and thumbnail document deletions atomically before any storage call. Cleanup failures are reported with paths, all remaining files are attempted, and the library refreshes even when storage cleanup is incomplete. No schema or public API changed.

The reviewer independently rechecked the helper and hook and ran all seven new regression tests. No new regression was found. The package's type check, ESM/CommonJS/declaration build and all 11 media tests passed. The independent reviewer subsequently verified 15 actual-hook browser scenarios across Chromium, Firefox and WebKit: rejected single/bulk transactions made zero storage calls; successful deletion refreshed and cleared selection; HTTP 403 cleanup produced a warning with the failed path, attempted the remaining files, refreshed once and cleared bulk selection. No uncaught exceptions or unexpected console errors were found. Evidence: `/private/tmp/sanity-kit-dependency-audit/media-delete-browser.log`. The coordinator subsequently verified actual Content Lake rejection for both a referenced image and video, with zero storage-signing calls and intact asset/thumbnail files. After removing the QA document, live deletion removed all three assets/files and refreshed the library to zero items. Final inventories match the original 17 content IDs and all 81 R2 objects, with only the previously documented Home metadata initialization revision difference. These live results were observed by the coordinator, not rerun by the independent reviewer.

## Pathname compatibility correction

The fresh reviewer cleared the scoped `definePathname` identity-validation fallback. An independent 384-evaluation comparison found unchanged older-version behavior and preserved caller rules. The coordinator's actual built helper passes nine regression checks on each of 5.12.0, 6.0.0, 6.12.0, 6.13.0 and 6.13.1. The reviewer also verified 48 actual-helper/validation browser scenarios across 6.12.0 and 6.13.1 in Chromium, Firefox and WebKit, with no unexpected errors or requests. The browser dataset and publication button were fixtures; no authenticated 6.13 Studio publication is claimed.

Named slug aliases and caller-supplied compiled rules remain subject to the upstream bug. This helper fix does not broaden the package peers or replace Sanity's validation engine. See the [full investigation](slug-regression-investigation.md).
