---
"@tinloof/sanity-next": patch
---

Fix draft mode type imports to use correct Next.js types

Updates the `defineEnableDraftMode` function to properly import and use the `DraftMode` type from Next.js headers. This ensures better type safety and compatibility with Next.js 15+.
