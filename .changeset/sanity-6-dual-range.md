---
"@tinloof/sanity-document-options": minor
"@tinloof/sanity-extends": minor
"@tinloof/sanity-next": minor
"@tinloof/sanity-web": minor
---

Support Sanity 6 alongside Sanity 5

The `sanity` peer range widens to `^5.12.0 || ^6.0.0`, and `next-sanity` to
`^12.1.0 || ^13.0.0`. These four packages work against either major from a
single build.

`@tinloof/sanity-next` no longer ships `sanity` or `@sanity/client` as regular
dependencies. Both are peers now (`sanity` an optional one, since the package
only uses it for three type imports). A nested copy of `@sanity/client` binds
the `declare module "@sanity/client"` augmentation that `sanity typegen generate`
emits to a different instance than the one `sanityFetch` reads, so consumers got
untyped fetch results. If your app does not already depend on `@sanity/client`
directly, add it.

`@tinloof/sanity-document-options` now depends on `@sanity/icons` v5 directly and
imports icons from their per-icon subpaths. The v5 barrel no longer exports the
named icons at runtime while still declaring them in its types, so barrel imports
type-check and then fail at bundle time. Icons are stateless, so carrying a v5
copy alongside a Sanity 5 studio's v3 copy is harmless.

`@tinloof/sanity-next` no longer imports next-sanity's live types by name.
next-sanity 12 exports them as `DefinedSanityFetchType` / `DefineSanityLiveOptions`
and 13 as `DefinedFetchType` / `DefineLiveOptions`, with neither major exporting
the other's spelling. They are now derived from `defineLive`, the one export both
majors share, so one build covers the whole peer range.
