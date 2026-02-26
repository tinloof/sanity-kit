---
"@tinloof/sanity-next": patch
---

Fix type conflicts when consumers have a different version of `@sanity/client` installed:

- Add `@sanity/client` to peerDependencies (following `next-sanity` pattern)
- Update `@sanity/client` from `^7.14.1` to `^7.16.0`
- Update `sanity` from `^5.7.0` to `^5.12.0`

This ensures `SanityClient` types are compatible when passed to components like `InfiniteScroll`.
