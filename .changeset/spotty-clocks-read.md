---
"@tinloof/sanity-next": minor
---

Add specialized fetch utilities for different Next.js use cases

- `sanityFetch` - For server components with automatic perspective and stega based on draft mode
- `sanityFetchMetadata` - For metadata generation without stega encoding
- `sanityFetchStaticParams` - For static params generation with published content only

These utilities are automatically included when using `initSanity()` and provide the right configuration for each specific use case in Next.js applications.
