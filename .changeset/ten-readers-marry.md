---
"@tinloof/sanity-next": patch
---

Add `@sanity/client` to peerDependencies to fix type conflicts when consumers have a different version installed. This follows the same pattern as `next-sanity` and ensures `SanityClient` types are compatible when passed to components like `InfiniteScroll`.
