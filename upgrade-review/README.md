# Dependency upgrade review

Updated September 10, 2026. Upgrade candidate based on `827d503947017f4099bc8897829e557f86ed8f45`, prepared for a draft pull request. Commit and push are authorized; merging and package publication remain subject to review. Test content was written only to the user-selected disposable Sanity project.

**All seven packages are ready for the user's release review on Sanity 6.13.1, with a unified `^6.12.0` peer range and no Sanity 5 support.** Builds, types, tests, packaged consumers and the authenticated standard pathname/translation flow pass. Versions were rehearsed in a temporary copy; source package versions remain unchanged until the release PR. Existing limitations and historical integration evidence are recorded below. See the [independent review](independent-review.md).

## Package status

All seven packages pass builds, types and packaging on 6.13.1. Earlier preview, media and failure-recovery integration evidence is retained separately from the new standard Studio checks below.

| Package | Proposed version | Completed locally | Integration results and review notes |
| --- | --- | --- | --- |
| `@tinloof/sanity-studio` | [3.0.0](release-notes/sanity-studio.md) | Sanity/UI/icons compatibility, deprecated wrapper removal, backward-compatible pathname validation fix, migration guidance, build/types/pack | Navigator/search, shared-pathname publication and same-locale collision passed |
| `@tinloof/sanity-document-i18n` | [3.0.0](release-notes/document-i18n.md) | Standard actions and reference strengthening, preserved metadata format, 53 tests, three-browser fixture, build/types/pack | Live deletion, revision conflict, partial failure/retry and cleanup passed |
| `@tinloof/sanity-document-options` | [3.0.0](release-notes/sanity-document-options.md) | Current schema/action types, versioned list queries, build/types/pack; historical older-consumer checks | Singleton editor action restrictions passed; global singleton creation and ordering are not established by this live run |
| `@tinloof/sanity-next` | [3.0.0](release-notes/sanity-next.md) | Next 16 / next-sanity 13 compatibility, TypeGen, build/types/pack, packed consumer SSR/hydration; real i18n website build and six published pages in three browsers | Authenticated preview and connected published updates passed; offline retention/recovery after reload passed, autonomous catch-up is not established |
| `@tinloof/sanity-web` | [3.0.0](release-notes/sanity-web.md) | Portable Text 8, 4 rendering tests, build/types/pack; earlier three-browser SSR/hydration checks | Review authored list-level jumps and custom renderers in release notes |
| `@tinloof/sanity-extends` | [3.0.0](release-notes/extends.md) | All 93 merge tests, build/types/pack, historical older-consumer checks | Major release because Sanity 5 support is removed; new-graph checks passed |
| `@tinloof/sanity-media` | [1.0.0](release-notes/sanity-media.md) | Current SDK/UI, 11 signing/authorization/deletion tests, both staging dialogs in three browsers, real R2 image/video upload/preview/delete in three browsers, decorative thumbnail fixes, build/types/pack | Live Studio upload, metadata and image/video selection passed. Three-browser deletion/warning/refresh fixture and live image/video reference protection passed; all QA records and files cleaned up |

## Compatibility decisions

September 10 follow-up: a fresh investigation identified the exact upstream slug-validation fault, reproduced it on newly checked Sanity 6.13.1, and tested a proposed upstream correction in isolation. See the [investigation, patch and issue draft](slug-regression-investigation.md). The user approved dropping Sanity 5 and selecting exact Sanity 6.13.1 for development/examples, with `^6.12.0` peers in every package. A scoped `definePathname` fix is now included, with 45 actual-package checks across five Sanity versions, 384 independent compatibility comparisons and 48 browser scenarios; it does not patch arbitrary consumer slug schemas.

| Area | Candidate and reason |
| --- | --- |
| Sanity | Exact **6.13.1** development/example dependencies and `^6.12.0` peers across all seven packages. This supports stable Sanity 6 from 6.12 and excludes Sanity 5, 7, and prereleases. The standard `definePathname` helper is fixed without bypassing validation or migrating data. Raw consumer slug schemas can still encounter the upstream regression; see the [consumer policy](consumer-version-policy.md). New-graph verification passed. |
| Client and UI | Client 8.6.1, UI 4.2.0, icons 5.2.1, React 19.2.8. Public React peers start at 19.2.4. |
| Websites and docs | Next 16.3.4, next-sanity 13.3.4 with `^13.3.4` peers in both Next and web packages (major 12 support removed), Portable Text 8.0.1, Fumadocs 16.15.8/MDX 15.4.0. Examples explicitly opt into upstream compatibility invalidation behavior; `initSanity` does not force it on all consumers. |
| Tooling | Repository Node 24.18.0 and pnpm 12.3.4. Native TypeScript 7 checking plus the TypeScript 6 compiler API alias required by existing builders. Babel, Rolldown and Vite development peers are explicit at the workspace root. |
| Other holds | pkg-utils 12.3.4 satisfies plugin-kit 10.0.9, whose peers exclude version 13. Node 24 type definitions match the selected runtime. |
| Translation format | Keep content `locale` (or the existing configured `localeField`) and metadata `_key: locale`. The deprecated Studio wrapper is removed. Downstream projects using a different upstream metadata format need inspection before switching imports. |

[Complete direct dependency inventory](dependencies.md), [standalone implementation](standalone-i18n.md), [live findings and QA cleanup](i18n-live-findings.md), [wrapper migration](deprecated-wrapper-follow-up.md).

## Verification

The final Sanity 6.13.1 graph passes frozen installation, workspace peer checks, seven library builds, all 17 workspace type checks, all three TypeGen commands, all 170 tests and all three standalone Studio builds. Affected package manifests pass formatting and the tracked diff passes whitespace checks.

Seven freshly versioned tarballs pass manifest inspection, with `^6.12.0` Sanity peers and internal package references resolving to 3.0.0. Six framework-independent roots pass ESM/CommonJS imports; the fresh consumer passes TypeScript and a production Next.js build. Consumer rendering and the updated documentation range page pass in Chromium, Firefox and WebKit without page errors or failed requests. The fixture's pnpm peer report treats a local `file:` tarball reference as incompatible with exact `3.0.0`; the installed extends manifest is 3.0.0 and its consumers require 3.0.0. This local fixture warning does not occur in the workspace peer check.

Evidence: `/private/tmp/sanity-kit-dependency-audit/six-only-*.log`, `final-6131-*`, and `/private/tmp/sanity-kit-final-6131-version`. The following paragraphs retain earlier Sanity 6.12 integration and minimum-Node evidence; those checks were not all repeated on 6.13.1.

The previous single-Sanity graph passed frozen installation with release-age checks enabled and has no peer dependency issues. The full verification run passed all seven library builds, all 17 workspace type checks, all three TypeGen commands, and all 151 then-existing tests. After the independent review fix, the expanded 53-test i18n suite, its type checks and build, and targeted Chromium/Firefox/WebKit checks passed again. Seven local tarballs are generated. The docs production build and Chromium/Firefox/WebKit checks pass, including search, the wrapper migration page and its link, navigation, mobile overflow and console checks.

The three standalone Studios also built on the previous graph. Those tarballs passed ESM/CommonJS imports for all six framework-independent roots on Node 24 and exact Node 22.12; the Next package passes inside a production Next consumer on Node 22.12, with SSR content and hydration verified in Chromium, Firefox and WebKit. Packed manifests contain no workspace source conditions or credentials, and the removed wrapper dependency is absent. Historical consumer checks also passed on Sanity 5.12 and 6.0 with next-sanity 12.1 and React 19.2.4. Those results do not restore support below the new Sanity 6.12 minimum. Six website applications compiled. The hello-world i18n website now also passes its real page-data production build using the authorized temporary viewer token; the other example sites still lack their own CMS configuration.

With the temporary viewer token, the real hello-world i18n website passes its production build and Chromium/Firefox/WebKit checks for all six existing localized pages, image decoding, default-locale routing, unpublished QA draft isolation (404), and rejection of a preview request without a secret (401). No content was published or edited for these checks. Browser tests used the existing approved `localhost:3000` origin, forwarded to the isolated candidate on `127.0.0.1:3111`, because an older local server occupied IPv4 port 3000. A later authenticated Studio edit and publication also updated an already connected Chromium visitor without reloading. Authenticated Presentation draft preview subsequently passed without exposing draft text publicly. Chromium/Firefox/WebKit retained content offline and recovered after an online reload. This does not establish autonomous reconnect without reload. A narrowly correlated WebKit unload CORS probe was independently investigated and is documented in the live findings. See the live findings for the cached-404 limitation when publication occurs without a connected visitor. The build still reports existing image `sizes` warnings. Evidence: `/private/tmp/sanity-kit-dependency-audit/viewer-real-website-{build,browser,webkit}.log`.

Both media staging dialogs also pass Chromium/Firefox/WebKit checks with a local video, including decoding, muted decorative previews, metadata editing and upload callbacks. Screenshots were inspected. These checks do not write to a storage bucket.

The root Biome check still reports 38 existing errors, down from the original baseline of 71. Most are formatting/import issues in untouched files. Two remaining errors in changed media files concern existing interactive video players without caption tracks. Decorative videos and icons were corrected; no empty caption track or lint suppression was added. Caption support needs a separate source/configuration design. This candidate does not claim a clean repository-wide lint run.

The final Changesets rehearsal in `/private/tmp/sanity-kit-final-media-1-review` generated 3.0.0 for six packages and 1.0.0 for media. Media 1.0.0 declares its public API stable, with future breaking changes requiring a major release. This rehearsal supersedes the earlier 0.2.0 media proposal. Versioned tarball inspection confirms published internal ranges, and source package versions remain unchanged. The media distribution files are byte-identical to the tested candidate. The subsequent next-sanity 13-only rehearsal is `/private/tmp/sanity-kit-final-next13-review`; its current artifact set is `/private/tmp/sanity-kit-dependency-audit/final-next13-tarballs`, retaining six 3.0.0 packages and media 1.0.0. CI workflows were reviewed locally but not run remotely; registry authentication, provenance permissions and notification delivery are deferred to the approved release process.

## next-sanity 13-only follow-up

Both Next and web packages now require `next-sanity: "^13.3.4"`. The Next implementation imports the version 13 public live types directly instead of deriving types across majors. The runtime cache action is unchanged. Targeted package builds, all 17 workspace type checks, all four Portable Text tests, frozen installation, workspace peer checks, the fresh versioned consumer type check/build and the documentation build pass. Evidence is in `next13-only-*.log` in the audit directory. The fresh consumer and updated version-range page also pass Chromium, Firefox and WebKit checks with no page errors or failed requests; temporary servers are stopped. Older next-sanity 12 consumer results below and in earlier reports are historical, not a support claim.

## Completed Sanity 6.13.1 standard Studio checks

The unmodified hello-world i18n Studio in authenticated Arc passed edit followed by immediate publication, French translation creation and same-pathname publication, reference strengthening, translation-group duplication retaining the latest title/text, same-locale duplicate rejection, clearing that error after changing the pathname, and two-step unlink/deletion of the copied French draft. The metadata retained the copied English reference after unlinking French.

All QA records were removed. The final inventory contains the exact 17 baseline document IDs; 16 revisions are unchanged, with only the known Home metadata initializer revision changing. No QA content remains. Studio and verification servers are stopped. Evidence: `six-only-live-evidence.json` and `six-only-cleanup.json` in the audit directory.

## Completed Sanity 6.12 integration and cleanup

These results and inventories belong to the completed earlier QA run; the new standard Studio checks are recorded above.

Translation creation, shared-pathname publication, strengthening, duplication, unlinking, draft/published deletion, stale-revision rejection, partial failure/retry and authenticated preview passed. The final raw Content Lake inventory exactly matches the original 17 non-system document IDs. Sixteen revisions are unchanged; only the known Home metadata initialization revision differs. No QA content or preview-secret document remains.

The Studio media run uploaded an image and video, generated a thumbnail, saved metadata and selected both assets into a QA document. Attempts to delete the referenced image and video were rejected by Sanity with visible errors and zero storage-signing calls. All three files and asset records stayed intact. After deleting the QA document, the standard deletion action successfully removed the video with its thumbnail and then the image, and the library refreshed to zero items. The R2 bucket exactly matches its original 81 keys, sizes, ETags and modification times (84,229,945 bytes). No original object was changed. Bulk deletion is covered by the actual-hook browser fixture; the existing library does not expose a bulk-delete button.

Temporary QA Studio, website, signing and fixture servers from that run were stopped. The ignored QA harness and logs remain for reproduction. The temporary viewer robot `Sanity Kit release QA 2026-09-09 viewer` (`g-jin16LLlETbX`) remains available for review with viewer-only access and expires September 16, 2026 at 13:40 UTC. Its token remains only in the ignored example `.env.local` with owner-only permissions. R2 credentials remain in `/private/tmp/sanity-kit-r2-qa.env` with owner-only permissions. No credentials were included in package artifacts.

Evidence: [live findings](i18n-live-findings.md), `/private/tmp/sanity-kit-dependency-audit/i18n-live/final-combined-cleanup.json`, `r2-baseline.json`, `r2-after.json`, and `media-qa-sign.log`.

The media fix commits all asset/thumbnail document deletions before storage cleanup, preserving referenced files when Sanity rejects deletion. Failed cleanup produces a warning with remaining paths and still refreshes the library. Seven new regression tests and independent review pass. Fifteen actual-hook browser scenarios across Chromium, Firefox and WebKit also pass, covering reference rejection with zero storage calls, successful single/bulk deletion, and HTTP 403 cleanup warnings that still attempt the remaining files, refresh and clear selection. No public API, schema or storage configuration changed.

## Security disposition for review

The final graph audit has **0 high, 0 critical, 2 moderate and 1 low** findings, with none suppressed. A newly reported smol-toml denial-of-service issue was resolved with the scoped 1.8.0 override. Actual framework TOML/YAML/JSON parsing and malformed-input rejection passed. Evidence: `smol-security-*.log` and `smol-security-audit.json`.

| Finding | Reachability and release guidance |
| --- | --- |
| uuid 10, moderate | Installed typeid-js uses v7/stringify; the reported buffer issue affects v3/v5/v6. Keep tracking the parent update and review other consumer paths. |
| esbuild 0.27.7, low | The advisory concerns its Windows development server. The affected tsup path is used for compilation here, not that server. Avoid an incompatible transitive major override. |
| adm-zip 0.6.0, moderate | The federation type downloader extracts remote archives. No remote type-download configuration was found in this repository; the advisory lists no patched release. Consumers that enable remote federation types must assess that path before release. |
| CLI parser overrides | Root overrides backport js-yaml 3.15.2 and smol-toml 1.8.0 for `@vercel/frameworks@3.29.0`. They do not travel with npm libraries. Consumers using that CLI path need the same scoped overrides until upstream fixes its pins. |

## Reproduce

Use the pinned Node and pnpm versions:

1. `pnpm install --frozen-lockfile`
2. `pnpm build && pnpm typegen && pnpm typecheck && pnpm test`
3. `pnpm peers check` and `pnpm audit`
4. `pnpm --filter @tinloof/sanity-studio test`
5. `pnpm --filter sanity-kit-docs build`
6. `pnpm exec changeset status`

The raw-Sanity probe `node upgrade-review/slug-validation-repro.mjs` intentionally still fails on affected upstream 6.13 releases. It diagnoses consumer schemas outside the helper fix and is not a passing release-suite command.

Logs, tarballs, the version rehearsal and browser screenshots are retained under `/private/tmp/sanity-kit-dependency-audit` and `/private/tmp/sanity-kit-final-release-rehearsal`. They are local evidence, not remote CI results. The candidate is ready for final user review with the limitations above. Review and merge this upgrade separately from the subsequent Changesets release PR. No merge or package publication is authorized by the request to push the code for review.

## Research references

- [Sanity document internationalization changelog](https://github.com/sanity-io/plugins/blob/main/plugins/@sanity/document-internationalization/CHANGELOG.md)
- [next-sanity 12 to 13 migration](https://github.com/sanity-io/next-sanity/blob/main/packages/next-sanity/MIGRATE-v12-to-v13.md)
- [Portable Text changes](https://github.com/portabletext/react-portabletext/blob/main/CHANGELOG.md)
- [react-rx changes](https://github.com/sanity-io/react-rx/blob/main/packages/react-rx/CHANGELOG.md)
- [Sanity TypeGen and native watch commands](https://www.sanity.io/docs/apis-and-sdks/sanity-typegen)
- [Vite SSR external configuration](https://vite.dev/config/ssr-options.html)
- [TypeScript 7 and compiler API compatibility](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)
- [Changesets CLI migration](https://github.com/changesets/changesets/blob/main/packages/cli/CHANGELOG.md)
- [js-yaml 3 security backports](https://github.com/nodeca/js-yaml/blob/3.15.2/CHANGELOG.md)
- [smol-toml 1.8.0](https://github.com/squirrelchat/smol-toml/releases/tag/v1.8.0)
- [uuid advisory](https://github.com/advisories/GHSA-w5hq-g745-h8pq), [esbuild advisory](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr), [adm-zip advisory](https://github.com/advisories/GHSA-vwc7-r8mq-g2x9)

The Next.js minimum decision is supported by the [Windows server advisory](https://github.com/advisories/GHSA-p293-qw3h-jr36) and [AVIF optimization advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4). Historical compatibility builds are not recommendations to install those old versions.
