---
"@tinloof/sanity-document-options": patch
---

Support nested folder structure with `structureGroup` arrays

The `structureGroup` option now accepts an array of strings to create nested folder paths:

```ts
defineType({
  name: 'home',
  type: 'document',
  options: {
    structureGroup: ['pages', 'marketing'], // Creates: Pages → Marketing → Home
  },
})
```

- Single strings still work as before: `structureGroup: "pages"`
- Arrays create nested paths: `structureGroup: ["pages", "marketing"]`
- Empty arrays or arrays with empty strings are treated as ungrouped
- Ordering is preserved at all nesting levels based on document definition order
