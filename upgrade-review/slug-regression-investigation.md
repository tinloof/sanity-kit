# Sanity 6.13 slug validation investigation

September 10, 2026. Independent fresh review plus coordinator reproduction. The user has approved a Sanity 6-only candidate with exact 6.13.1 development/example dependencies and `^6.12.0` peers; complete-graph and authenticated standard Studio verification passed (see [release review](README.md)). A scoped `definePathname` compatibility fix is now implemented in the release candidate, as described below.

## Outcome

The fault is identified, reproducible without Sanity Kit, and still present in the newly checked 6.13.1 release. A proposed upstream correction passes 16 targeted regression scenarios and a separate capability-classification check. This is an experimental fix, not a published or fully validated Sanity release.

## Exact cause

Upstream commit [`7de17c29494b392553cae32fbf3e9fc010883695`](https://github.com/sanity-io/sanity/commit/7de17c29494b392553cae32fbf3e9fc010883695), [PR #14306](https://github.com/sanity-io/sanity/pull/14306), introduced capability-aware validation in 6.13.0. It split slug structure, default uniqueness and custom uniqueness into separate validators.

In `packages/@sanity/validation/src/util/normalizeValidationRules.ts`, `baseRuleReducer` now selects default/custom uniqueness from `type.options` while compiling the builtin slug rule. Consumer fields subsequently inherit that rule, before their own `options.isUnique` can affect selection. In 6.12, the validator selected the callback from `context.type.options` at execution time, when the final field options are available.

This conflicts with Sanity's documented [`options.isUnique` behavior](https://www.sanity.io/docs/studio/slug-type). The defect can ignore either a custom approval or a custom rejection. It therefore both blocks valid cross-locale shared paths and can permit duplicates that a custom policy would reject.

## Evidence

| Check | Result |
| --- | --- |
| Existing standalone probe, 6.12 | Callback runs once, no default query, passes. |
| Same probe, 6.13.0 | Callback never runs, default query executes, fails. |
| Fresh isolated installation, 6.13.1 | Same failure. Downloaded package source confirms the faulty selection remains. |
| Expanded 16-case compatibility matrix, 6.12 | All 16 pass. |
| Expanded matrix, unmodified 6.13.1 | Six callback-selection scenarios fail. Direct slug fields with an explicit identity validation function pass; named aliases still fail. |
| Proposed upstream patch, 6.13.1 | All 16 independent regression scenarios pass. Coordinator rerun passes. |
| Default-only slug with custom validation disabled | Separate direct Rule check preserves zero incomplete markers and one default query. |

The independent patch scenarios cover true/false callbacks against opposing default responses, aliases and overrides, nested/array fields, asynchronous callbacks, context shape, delegation to `defaultIsUnique`, thrown errors, malformed/empty values, disabled custom validation and absent client capability. They do not replace the upstream test suite or live Studio acceptance.

The coordinator's [compatibility matrix](slug-validation-matrix.mjs) runs with `node upgrade-review/slug-validation-matrix.mjs`. To test another installation, append its absolute `node_modules/sanity/package.json` path. Failures on affected versions are intentional diagnostics. The original [minimal probe](slug-validation-repro.mjs) remains available.

## Proposed upstream correction

The [source patch](upstream-slug-validation.patch) changes three internal files. It registers both uniqueness rules and selects the applicable behavior using the final field context. The default rule skips fields with a custom callback. The custom rule skips fields without one before the engine classifies custom-validation capability. Structural validation, default-query behavior and callback failures remain active.

The extra classification guard matters: an earlier dual-rule experiment restored callbacks but incorrectly marked default-only slugs incomplete when custom validation was disabled. The final experimental patch corrects that case.

The patch has only been applied to disposable package copies using a Node resolution hook for both schema compilation and runtime validation. No installed workspace dependency, package manifest, lockfile or consumer schema was patched. It needs maintainer review, upstream tests and subsequent Studio verification before adoption. A root package-manager patch would not automatically protect users installing our npm libraries.

## Narrow helper workaround

For direct fields produced by `definePathname`, adding `validation: schema.validation ?? ((rule) => rule)` forces field-level normalization through Sanity's public validation API. It does not disable uniqueness or change content data, and it preserves caller-provided validation. The matrix confirms the mechanism for direct slug fields on 6.13.1.

This does not repair inherited named slug aliases or arbitrary schemas used with the standalone translation plugin. Caller-supplied validation is preserved; inherited precompiled Rule objects can retain the upstream defect. The identity fallback is now implemented in `definePathname`. Package compatibility and this upstream consumer-schema limitation are tracked separately under the [unified peer policy](consumer-version-policy.md). No schema migration or public API change is required.

## Release decision

The user approved dropping Sanity 5 support and using exact 6.13.1 for development/examples, with `^6.12.0` peers across all seven packages. The corrected standard pathname implementation is being verified on that complete graph. Arbitrary consumer slug schemas remain an upstream limitation; affected consumers can select 6.12.0 within the supported range. No issue, PR, commit, push or publication was created. The [upstream issue draft](slug-regression-upstream-issue.md) and experimental patch remain available for review.

Evidence is retained under `/private/tmp/sanity-kit-dependency-audit/slug-investigation` and `/private/tmp/sanity-kit-dependency-audit/slug-fresh-review`. The fresh 6.13.1 installation used `--ignore-scripts`; no live content or storage mutation was needed for this investigation.

## Implemented helper fix and backward compatibility

The user authorized implementation. `definePathname` now supplies the identity validation callback only when the caller supplied none. The helper fix itself changed no production dependency, peer range, stored content, or upstream package. The subsequent user-approved peer and dependency update is a separate release decision. The fixture correction uses a mock client on older validation APIs and accepts their existing multiple required-value markers; neither adjustment changes production behavior.

Verification:

- Actual built helper: nine regression tests pass on each of Sanity 5.12.0, 6.0.0, 6.12.0, 6.13.0 and 6.13.1 (45 checks). These older-version checks concern the helper only; they do not expand the whole package's declared peers.
- Independent before/after comparison: 384 schema evaluations across 5.12.0, 6.0.0, 6.12.0 and 6.13.1 preserve older-version behavior and supplied functions, context functions, arrays and compiled Rule objects.
- Actual helper plus actual Sanity validation in Chromium/Firefox/WebKit: 48 scenarios pass across 6.12.0 and 6.13.1. Shared translated paths, duplicate rejection, custom callbacks, optional/required fields, failure and recovery pass with no page/console errors or unexpected network requests. This is a local form fixture with mocked content and a stubbed field renderer, not authenticated Studio publication.
- Source formatting, package type check, distribution build and repacking pass. The native regression suite is integrated into the package and Turbo with a build prerequisite.

Evidence: `slug-investigation/helper-actual-*.log`, `slug-fresh-review/helper-*-results.json`, and `pathname-browser/check.log` under `/private/tmp/sanity-kit-dependency-audit`. The newly packed Studio artifact includes the fix. The proposed Studio release remains 3.0.0.
