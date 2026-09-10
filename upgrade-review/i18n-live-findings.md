# Authenticated translation checks

The September 10 Sanity 6.13.1 follow-up passes the standard pathname and translation checks, with all QA content cleaned up. See [current results and evidence](README.md#completed-sanity-6131-standard-studio-checks). Earlier runs below are retained as history.

September 9, 2026. Local Sanity 6.13.0 Studio in Arc, authenticated with the Tinloof account. The user selected `hello-world-i18n-studio`, project `rnkfj9jg`, dataset `production`, for testing. Writes were limited to labeled QA content, apart from the existing singleton initialization described below.

## Historical Sanity 6.13.0 results before the helper fix

| Check | Result |
| --- | --- |
| Create and publish English page | Passed with a title, pathname, and text section. |
| Create French translation | Passed. Content copied and metadata linked both documents using `_key: "en"` and `_key: "fr"`. |
| Open and edit translation | Passed through the translation menu. |
| Publish French with the same pathname | Failed. Studio reported that the slug was already in use and disabled publication. |
| Publish French with a distinct pathname | Passed. This was a QA workaround, not an acceptable compatibility fix. |
| Reference strengthening | Both published references retained `_weak: true` and `_strengthenOnPublish`. |
| Translation-aware duplication/deletion | Not verified live. The default example only exposes ordinary Sanity actions. Temporary wiring for the two QA IDs was restored after Arc stopped exposing page controls or screenshots. |
| Cleanup | Passed after explicit user approval. The authenticated CLI deleted all three QA records; a raw-perspective query confirmed that their published and draft IDs are absent. This does not verify the plugin's delete actions. |

## Findings from the first live run

1. **Custom slug validation is ignored.** The pathname schema supplies a locale-aware `options.isUnique`. The corresponding GROQ query finds no same-locale conflict for the French QA document, but Studio runs the default uniqueness check across locales. [Sanity's slug documentation](https://www.sanity.io/docs/studio/slug-type) describes `isUnique` as the override for this check.

   Run `node upgrade-review/slug-validation-repro.mjs` with the repository's Node version after installing dependencies. It compiles a plain Sanity schema with an `isUnique` callback that always returns true, then invokes the installed validation engine with a mock client. No plugin code or network is involved. With Sanity 6.13.0, the callback runs zero times, the default query executes, and the assertion fails. This intentional failing diagnostic is kept outside the normal passing unit suite. Fix or select a compatible upstream release and rerun the diagnostic plus same-pathname publication before release. No dependency patch or validation bypass was applied.

2. **The standard configuration does not expose all exported workflows.** `documentI18n` installs a metadata delete action but does not install `DuplicateWithTranslationsAction` or `DeleteTranslationAction` for content. The example does not add them itself. Metadata schema registration in `plugin.tsx` and the management button in `locale-manage.tsx` are commented out. Reference strengthening is mounted only in the metadata editor, which explains a plausible missing path for the observed weak references. Decide and implement the intended standard integration, then verify group duplication, unlinking, deletion, and strengthening. Registering a schema or changing the plugin's public behavior requires review first.

3. **Live failure recovery remains open.** Unit and browser-fixture coverage passes, but actual backend rejection, partial duplication failure, and cleanup through the exported actions have not been established by this session.

## Previous-release compatibility investigation

At that September 9 investigation, the npm registry reported Sanity and `@sanity/validation` 6.13.0 as latest. An isolated installation of Sanity 6.12.0 with React/React DOM 19.2.8 passes the same custom-slug diagnostic: one callback invocation, no default uniqueness query, and no validation markers. Its files are under `/private/tmp/sanity-kit-dependency-audit/sanity-6.12-check/`.

The workspace was then held on Sanity 6.12.0, with Studio, i18n, and media peers excluding 6.13 and a workspace override for auto-installed peers. Authenticated shared-pathname publication subsequently passed on 6.12. That historical hold is superseded by the user-approved `^6.12.0` policy and 6.13.1 development graph after the `definePathname` fix. Complete-graph and authenticated 6.13.1 acceptance are in progress; this report does not claim them.

## Current standard integration

The normal content action resolver now installs group duplication and reference-aware deletion, preserves prior action restrictions, and leaves release-version actions unchanged. Metadata copies are created directly through a client transaction, so they do not require a registered metadata editor schema. The content editor strengthens published references using revision-guarded patches. No metadata schema or data migration was added.

The focused suite now has 53 passing tests. Loading/error guards block deletion until references are known; unlinking matches the actual document reference and checks the metadata revision, including when a document's locale field is stale. Chromium, Firefox, and WebKit pass the updated local creation/navigation/failure fixture. These are local fixtures, not live Content Lake mutation evidence.

The authenticated Arc check also found an example configuration-order bug: i18n ran before the Structure tool supplied its default actions. Both affected example configs now place `documentOptions()` or `structureTool()` before `documentI18n()`. Reloading the actual Studio confirmed `Duplicate with translations` (disabled without metadata) and `Delete translation...` in the document menu. Setup and wrapper-migration documentation now state this ordering requirement. Both affected example type checks, the standalone Studio build, and the docs production build pass after this fix. Chromium, Firefox, and WebKit also verify the order guidance on the rendered setup and migration pages. This verifies action registration, not execution of the mutations.

The final-candidate checks below supersede these earlier pending items. The original three QA records below remain deleted.

## Deleted QA records

These exact records were created during this test and subsequently deleted with explicit user approval. No duplicate copies were created. The user confirmed that this entire project is for testing; destructive actions in other projects still require confirmation.

| Record | ID | State before cleanup |
| --- | --- | --- |
| Sanity Kit QA 2026-09-09 | `11b376d8-7c82-447f-ab4c-afc758777644` | Published English, `/sanity-kit-qa-2026-09-09` |
| Sanity Kit QA 2026-09-09 FR | `ff50035d-d37f-44c8-a6f5-6f31fc03e29b` | Published French, `/sanity-kit-qa-2026-09-09-fr` |
| QA translation metadata | `980a5778-0651-465c-b432-814645424936` | References only the two QA pages |

Before cleanup, raw-perspective inspection found these three additions and no drafts. After cleanup, all six published/draft IDs were absent. Of the 17 pre-test baseline documents, 16 retained their exact revisions. `home_translations_metadata` changed revision. Its latest transaction history shows repeated `createIfNotExists` operations, matching the existing call in `packages/sanity-document-options/src/structure-items/localized-singleton-item.ts`. Its original creation/update timestamp remains December 1, 2025. This is initialization activity on an existing record, so this report does not claim zero remote writes to original records. No original content was deliberately patched or restored.

The pre-test ID/revision baseline and diagnostics are retained in `/private/tmp/sanity-kit-dependency-audit/i18n-live/`. No schema was deployed, credentials changed, code committed, branch pushed, or package published.

## Completed live QA on the earlier Sanity 6.12 candidate

The user explicitly approved creation, editing, publication, duplication, unlinking, deletion, and cleanup of labeled QA records in this test project. The earlier publication-only approval blocker is resolved.

| Check | Result |
| --- | --- |
| English publication | Passed. Published `40b9c38a-1049-4239-9a30-e2fe496fc600`, locale `en`, pathname `/sanity-kit-qa-612`. |
| French creation and navigation | Passed through the standard translation menu. Copied content and pathname, set locale `fr`, created `36b0435a-1561-48be-a097-8a90eb4db9a2`. |
| Shared-pathname publication | Passed. Both locales published with `/sanity-kit-qa-612`. |
| Reference strengthening | Passed. Metadata `190d853c-38b8-47ed-8ef4-064ec9f03ec1` initially contained a strong English reference and a weak French draft reference. French publication removed both `_weak` and `_strengthenOnPublish`. |
| Group duplication | Passed through `Duplicate with translations`. Created draft English `ab1d6c52-4068-415f-a2ec-f988052285ac`, draft French `f7f38aab-a1e5-4406-809d-039888545d8f`, and metadata `655834db-6415-4b99-92b6-4c451e730c9d`. Copied each locale's content and linked only the new IDs with weak draft references. |
| Same-locale collision | Passed. The French copy shows `URL Slug is already in use` and disables Publish. |
| Connected-visitor updates | Passed in Chromium. The published French page changed from its original text to `Sanity Kit QA live update verified. Temporary French content.` without navigation or reload after a Studio edit and publication. |
| Draft-copy deletion | Passed through the standard two-step unlink/delete UI. The French copy was unlinked first, then deleted; both draft/published IDs are absent. |
| Published translation deletion | Passed through the same workflow. The strong metadata reference was removed before Sanity deleted both the French published document and its draft. |
| Revision conflict | Passed against Content Lake. An intentionally stale revision on QA metadata returned 409 without writing the test field. |
| Partial duplication failure and retry | Passed. A temporary weak reference to a missing QA source caused duplication to fail after creating one partial draft. Source revisions remained unchanged. Restoring the reference list allowed a successful retry. All resulting QA copies were subsequently deleted. The server error was recorded; the live toast was not captured. |
| Authenticated draft preview | Passed in Arc Presentation. An unpublished French edit appeared in the preview while the public website continued serving the previous published text. Raw Content Lake queries confirmed the separation. |
| Navigator and singleton actions | English/French navigation and pathname search passed. Settings and English Home editors omitted duplicate/delete actions. The global creation menu still exposes localized Home templates, so this does not establish singleton creation restrictions. |
| Translation cleanup | Passed. All QA translation documents, partial copies, metadata and the temporary preview secret were deleted. All 17 original documents remain; only the known Home metadata initialization revision differs. The subsequent media QA records have also been cleaned up; the final combined snapshot confirms the original baseline. |

A text-entry attempt dropped the first characters of the French QA text. Automatic approval review stopped publication. The field was corrected using its accessibility value, and both the UI and a raw Content Lake query verified the complete title and section text before publication succeeded.

The website was stopped when the earlier English publication happened. On restarting it, the prior draft-isolation request remained cached as a null result, returning HTTP 404 for `/en/sanity-kit-qa-612`. Upstream documents that publications without a connected browser require server-side invalidation for guaranteed freshness; the compatibility action does not supply that fallback. In the subsequent test, a visitor on an existing page connected to the live-events API before French publication. The French URL then returned HTTP 200 on a fresh request. A visitor already sitting on the 404 page did not update automatically. Once the published French page was loaded, its next published text edit updated in place successfully.

Evidence: `i18n-live/sanity-612-published-and-duplicated.json`, `connected-live-check.log`, and `connected-french-check.log` under `/private/tmp/sanity-kit-dependency-audit/`. Authenticated draft preview subsequently passed. Chromium, Firefox and WebKit retained published content during offline checks and recovered after an online reload; these tests do not establish autonomous reconnect/catch-up without reloading. WebKit emitted a CORS-probe error when reload cancelled the old live connection. The independent reviewer reproduced it in an online-only control and two reconnect runs: the new page and live stream returned 200 and content remained correct. Treat only this correlated unload diagnostic as non-blocking; do not suppress general CORS errors.

Additional evidence: `i18n-live/failure-recovery-before-cleanup.json`, `i18n-live/after-final-cleanup.json`, `qa-draft-isolation.html`, `reconnect-browser.log`, and `reconnect-webkit-diagnostic.log`. The cleanup snapshot precedes removal of the temporary preview secret and the later media run; `i18n-live/final-combined-cleanup.json` supersedes it and contains exactly the original 17 non-system documents.

## Final media integration and combined cleanup

September 10: the real Studio uploaded a labeled image, video and generated thumbnail, saved metadata and selected both into a QA document. Single-image and video-with-thumbnail deletion attempts were rejected by Content Lake because the QA draft referenced them. The UI displayed the reference errors; the signing log contained no delete requests and all three files/records remained intact.

After the QA draft was deleted, the standard media deletion action removed the video and thumbnail, then the image. The library refreshed from three items to one to zero. All four QA Sanity records are absent. The final non-system inventory matches the 17 baseline IDs; only `home_translations_metadata` has the previously explained initialization revision change. R2 matches all 81 original keys, sizes, ETags and modification times exactly.

The bulk deletion hook passed independent three-browser fixture checks, but the existing Studio library exposes only single deletion, so no live bulk-delete UI result is claimed. Temporary QA servers were stopped after verification.
