---
"@tinloof/sanity-next": minor
---

Add opt-in exact query-string redirect matching before path fallback through `redirects.matchQueryString` in `initSanity` and both utility initializers. Expose custom redirect queries through `redirects.query`, preserving the existing `$paths` contract, published-only lookups, disabled stega, and 301/302 responses. Existing callers retain path-only behavior.
