# Direct dependency inventory

General registry snapshot: September 9, 2026; Sanity release-family selection refreshed to 6.13.1 on September 10. This table covers runtime and development dependencies, not every transitive dependency. Applied versions are local manifest ranges; the lockfile fixes the actual resolution. An updated version is not a claim that its authenticated integration tests have passed. See [release gates](README.md).

| Dependency | Before | Local candidate | Latest at audit | Disposition |
| --- | --- | --- | --- | --- |
| `@aws-sdk/client-s3` | `^3.800.0` | `^3.1128.0` | 3.1128.0 | Applied |
| `@aws-sdk/s3-request-presigner` | `^3.800.0` | `^3.1128.0` | 3.1128.0 | Applied |
| `@biomejs/biome` | `2.4.4`, `^2.3.8` | `2.5.12`, `^2.5.12` | 2.5.12 | Applied |
| `@changesets/cli` | `^2.29.8` | `^3.0.2` | 3.0.2 | Applied |
| `@heroicons/react` | `^2.2.0` | `^2.2.0` | 2.2.0 | Applied |
| `@next/env` |  | `16.3.4` | See manifest | Applied |
| `@portabletext/react` | `^6.0.2` | `^8.0.1` | 8.0.1 | Applied |
| `@portabletext/types` | `^4.0.1` | `^4.0.2` | 4.0.2 | Applied |
| `@sanity/asset-utils` | `^2.3.0` | `^2.3.0` | 2.3.0 | Applied |
| `@sanity/client` | `^7.16.0` | `^8.6.1` | 8.6.1 | Applied |
| `@sanity/code-input` | `^7.0.8` | `^7.3.8` | 7.3.8 | Applied |
| `@sanity/document-internationalization` | `^4.1.1` | Removed | 6.2.35 | Deprecated wrapper removed; standalone plugin selected. |
| `@sanity/icons` | `^3.7.4` | `^5.2.1` | 5.2.1 | Applied |
| `@sanity/image-url` | `^2.0.3` | `^2.1.1` | 2.1.1 | Applied |
| `@sanity/incompatible-plugin` | `^1.0.5` | `^1.0.5` | 1.0.5 | Applied |
| `@sanity/mutator` | `^5.12.0` | `6.13.1` | 6.13.1 | Selected for the unified Sanity 6-only candidate; graph verification in progress. |
| `@sanity/orderable-document-list` | `^1.5.1` | `^2.0.23` | 2.0.23 | Applied |
| `@sanity/pkg-utils` | `^10.1.1` | `^12.3.4` | 13.0.0 | 12.3.4 retained because plugin-kit 10 requires the 12.x line. |
| `@sanity/plugin-kit` | `^4.0.20` | `^10.0.9` | 10.0.9 | Applied |
| `@sanity/preview-url-secret` | `^4.0.3` | `^4.1.5` | 4.1.5 | Applied |
| `@sanity/studio-secrets` | `^3.0.3` | `^4.0.19` | 4.0.19 | Applied |
| `@sanity/table` | `^2.0.1` | `^3.1.16` | 3.1.16 | Applied |
| `@sanity/types` | `^5.12.0` | `6.13.1` | 6.13.1 | Selected for the unified Sanity 6-only candidate; graph verification in progress. |
| `@sanity/ui` | `^3.1.11`, `^3.1.13` | `^4.2.0` | 4.2.0 | Applied |
| `@sanity/util` | `^5.12.0` | `6.13.1` | 6.13.1 | Selected for the unified Sanity 6-only candidate; graph verification in progress. |
| `@sanity/uuid` | `^3.0.2` | `^3.0.3` | 3.0.3 | Applied |
| `@sanity/vision` | `^5.12.0` | `6.13.1` | 6.13.1 | Selected for the unified Sanity 6-only candidate; graph verification in progress. |
| `@tailwindcss/postcss` | `^4.2.1` | `4.3.3`, `^4.3.3` | 4.3.3 | Applied |
| `@tailwindcss/typography` | `0.5.19` | `0.5.20` | 0.5.20 | Applied |
| `@tanstack/react-virtual` | `^3.13.19` | `^3.14.11` | 3.14.11 | Applied |
| `@types/lodash` | `^4.17.24` | `^4.17.25` | 4.17.25 | Applied |
| `@types/mdx` | `^2.0.13` | `^2.0.14` | 2.0.14 | Applied |
| `@types/node` | `^24.10.15` | `^24.13.3` | 26.5.0 | 24.x matches the selected Node 24 runtime. |
| `@types/pluralize` | `^0.0.33` | `^0.0.33` | 0.0.33 | Applied |
| `@types/react` | `^19.2.10`, `^19.2.14` | `^19.2.18` | 19.2.18 | Applied |
| `@types/react-dom` | `^19.2.3` | `^19.2.7` | 19.2.7 | Applied |
| `@types/react-is` | `^19.2.0` | `^19.2.0` | 19.2.0 | Applied |
| `@types/react-syntax-highlighter` | `^15.5.13` | `^15.5.13` | 15.5.13 | Applied |
| `@types/speakingurl` | `^13.0.6` | `^13.0.6` | 13.0.6 | Applied |
| `@typescript/native` |  | `npm:typescript@7.0.2` | See manifest | TypeScript 7 alias, added for source checking. |
| `autoprefixer` | `10.4.27` | `10.5.5` | 10.5.5 | Applied |
| `babel-plugin-react-compiler` | `1.0.0` | `1.0.0` | 1.0.0 | Applied |
| `classnames` | `2.5.1` | `2.5.1` | 2.5.1 | Applied |
| `clsx` | `^2.1.1` | `^2.1.1` | 2.1.1 | Applied |
| `fumadocs-core` | `16.6.6` | `16.15.8` | 16.15.8 | Applied |
| `fumadocs-mdx` | `14.2.8` | `15.4.0` | 15.4.0 | Applied |
| `fumadocs-ui` | `16.6.6` | `16.15.8` | 16.15.8 | Applied |
| `groq` | `^5.12.0` | `6.13.1` | 6.13.1 | Selected for the unified Sanity 6-only candidate; graph verification in progress. |
| `lodash` | `^4.17.23` | `^4.18.1` | 4.18.1 | Applied |
| `lucide-react` | `^0.575.0` | `^1.43.0` | 1.43.0 | Applied |
| `nanoid` | `^5.1.6` | `^6.0.1` | 6.0.1 | Applied |
| `next` | `16.1.6`, `^16.1.6` | `16.3.4`, `^16.3.4` | 16.3.4 | Applied |
| `next-sanity` | `^12.1.0` | `^13.3.4` | 13.3.4 | Applied |
| `npm-run-all2` | `^8.0.4` | `^9.0.3` | 9.0.3 | Applied |
| `oxfmt` |  | `^0.63.0` | See manifest | Applied |
| `oxlint` |  | `^1.80.0` | See manifest | Applied |
| `pluralize` | `^8.0.0` | `^8.0.0` | 8.0.0 | Applied |
| `postcss` | `8.5.6`, `^8.5.6` | `8.5.28`, `^8.5.28` | 8.5.28 | Applied |
| `react` | `^19.2.4` | `^19.2.8` | 19.2.8 | Applied |
| `react-dom` | `^19.2.4` | `^19.2.8` | 19.2.8 | Applied |
| `react-is` | `^19.2.4` | `^19.2.8` | 19.2.8 | Applied |
| `react-rx` | `^4.2.2` | `^6.1.0` | 6.1.0 | Applied |
| `react-syntax-highlighter` | `^16.1.1` | `^16.1.1` | 16.1.1 | Applied |
| `rimraf` | `^6.1.2`, `^6.1.3` | `^6.1.3` | 6.1.3 | Applied |
| `rxjs` | `^7.8.2` | `^7.8.2` | 7.8.2 | Applied |
| `sanity` | `^5.12.0`, `^5.7.0` | `6.13.1` | 6.13.1 | Selected for the unified Sanity 6-only candidate; graph verification in progress. |
| `sanity-plugin-utils` | `^1.8.0` | `^2.0.17` | 2.0.17 | Applied |
| `server-only` | `0.0.1` | `0.0.1` | 0.0.1 | Applied |
| `speakingurl` | `^14.0.1` | `^14.0.1` | 14.0.1 | Applied |
| `styled-components` | `^6.3.11`, `^6.3.8` | `^6.5.3` | 6.5.3 | Applied |
| `suspend-react` | `^0.1.3` | `^0.1.3` | 0.1.3 | Applied |
| `swr` | `^2.3.3`, `^2.4.0` | `^2.5.1` | 2.5.1 | Applied |
| `tailwind-merge` | `^3.5.0` | `^3.6.0` | 3.6.0 | Applied |
| `tailwindcss` | `4.2.1`, `^4.2.1` | `4.3.3`, `^4.3.3` | 4.3.3 | Applied |
| `tsup` | `^8.5.1` | `^8.5.1` | 8.5.1 | Applied |
| `tsx` | `^4.21.0` | `^4.23.13` | 4.23.13 | Applied |
| `turbo` | `^2.6.3` | `^2.10.12` | 2.10.12 | Applied |
| `typescript` | `^5.9.3` | `npm:@typescript/typescript6@6.0.2` | 7.0.2 | Classic API compatibility package for builders; TypeScript 7 handles source checks. |
| `use-debounce` | `^10.1.0` | `^10.1.1` | 10.1.1 | Applied |
| `vitest` | `^4.0.18` | `^5.0.0` | 5.0.0 | Applied |
| `watch` | `^1.0.2` | Removed | 1.0.2 | Removed; native Sanity schema/query watchers replace it. |

All seven packages now declare Sanity `^6.12.0`; Sanity 5 support is removed. Complete-graph and authenticated standard-Studio checks on 6.13.1 are in progress. Historical older-consumer checks do not expand this support policy. Workspace dependencies remain `workspace:*`; local packages were not replaced with their published registry versions.

The `@tinloof/sanity-next` Next.js peer minimum is now `^16.3.4`. The former `^16.1.6` range admitted versions with critical advisories. This is separate from the direct dependency version table above.

## Current graph refresh

Direct development/example dependencies and the workspace Sanity override now select 6.13.1. The previous 6.12 graph and narrow peer holds are superseded. Installation, peer resolution, and release-age handling for the new graph are being verified; the manifest update alone does not establish a passing lockfile.

## Historical 6.12 lockfile refresh

The previous refresh removed mixed auto-resolved Sanity versions and retained release-age checks. These results belong to the earlier 6.12 candidate.

The refresh also advanced four transitive patch lines. Their changes were inspected before the final build checks:

| Dependency | Change | Assessment |
| --- | --- | --- |
| `@lezer/java` 1.1.3 to 1.1.4 | Bundled changelog: correct string escapes, octal literal syntax and operator precedence | Java syntax parser corrections; no schema or application API change |
| `ignore` 7.0.8 to 7.0.9 | Installed source diff rejects a BOM-only/space-only pattern after trimming | Ignore-pattern parsing correction; one regex change in the main implementation |
| Yuku packages 0.9.4 to 0.9.5 | [Upstream release](https://github.com/yuku-toolchain/yuku/releases/tag/v0.9.5) reports no significant changes; parser entry-point diff is empty | Native parser/analyzer patch line; all platform bindings updated together |
| `electron-to-chromium` 1.5.422 to 1.5.423 | Browser-version mapping data refresh | Build target metadata, no application API change |

The root now explicitly provides the already-used development peers `@babel/core` 7.29.7, Rolldown 1.2.7 and Vite 8.2.2. The i18n Next example supplied Sanity 6.12 and client 8.6.1 as development peers at that stage; its Sanity development dependency now selects 6.13.1. No new production dependency was introduced by these peer repairs.
