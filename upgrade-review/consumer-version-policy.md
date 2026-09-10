# Consumer Sanity version policy

All seven release candidates declare `sanity: "^6.12.0"` as a peer dependency. The user approved dropping Sanity 5 and using the newest stable Sanity 6 release. Development dependencies and examples select exactly `6.13.1`; the complete graph passes the checks recorded in [the release review](README.md). The minimum is the chosen support baseline, not a claim that every earlier Sanity 6 version is broken.

The packages share the consuming project's Sanity installation. The Next package's Sanity peer remains optional. A peer range declares compatibility and does not enforce a runtime lock.

| Consumer installation | Result |
| --- | --- |
| Sanity 5.x, or 6.0 through 6.11 | Outside the supported range |
| Stable Sanity 6.12.x, 6.13.x, or a later 6.x version | Within `^6.12.0`, equivalent to `>=6.12.0 <7.0.0` for stable versions |
| Sanity 7 or a beta/canary prerelease | Outside the range |
| Installation with peer checks ignored or forced | Can run an unsupported host; the package's peer declaration does not prevent execution |
| Installing only extends, document-options, next, or web | The same Sanity 6-only policy applies; there is no separate Sanity 5 range |

For reproducible installations, select an exact tested Sanity version and commit the lockfile. Configure strict peer checks in the consuming project's package manager and CI if incompatible installations must fail. Root overrides and CI settings in Sanity Kit do not propagate into published npm packages. A future stable 6.x release being inside the range is a semver compatibility declaration, not a claim that it has already been tested.

## Pathname compatibility

The updated `definePathname` helper initializes validation after its field options are available. This preserves locale-aware uniqueness on Sanity 6.13 without changing stored content or disabling duplicate protection. Actual helper tests pass on 6.13.0 and 6.13.1, and the browser fixture passes on 6.12.0 and 6.13.1. Authenticated standard-Studio checks on 6.13.1 also pass: shared-pathname publication, same-locale collision rejection and recovery, translation-group duplication, reference strengthening and unlink/deletion.

Sanity 6.13 still has an upstream regression affecting raw consumer slug schemas, including inherited named aliases and precompiled validation rules. The helper fix does not patch those schemas. Consumers using them should verify their custom uniqueness checks and can select 6.12.0 within the supported range while awaiting an upstream fix. This limitation does not establish an incompatibility in the media, rendering, or schema-merge packages. See the [investigation](slug-regression-investigation.md).

Sources: [npm peer dependencies](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#peerdependencies), [pnpm peer settings](https://pnpm.io/settings/peer-dependencies#strictpeerdependencies), and [semver prerelease rules](https://github.com/npm/node-semver#prerelease-tags).

## next-sanity version policy

Both `@tinloof/sanity-next` and `@tinloof/sanity-web` require `next-sanity: "^13.3.4"`. This supports stable 13.x from the tested 13.3.4 baseline and excludes major 12, major 14, and prereleases. The Next package imports the public version 13 live types directly; the cross-major type derivation is removed. The example cache action remains because it preserves the selected behavior on version 13, rather than enabling installation on version 12.
