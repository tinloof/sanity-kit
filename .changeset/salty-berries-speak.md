---
"@tinloof/sanity-extends": minor
---

Add `CreateAbstractsConfig` utility type for generating abstracts configuration objects

This helper type simplifies creating configuration types that allow disabling all abstracts or selectively enabling/disabling specific document types. Useful when building reusable schema packages or plugins that need flexible abstract type configuration.

Example:

```ts
type MyAbstracts = CreateAbstractsConfig<"page" | "article" | "product">;
// Result: false | { page?: boolean; article?: boolean; product?: boolean }
```
