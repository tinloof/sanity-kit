---
"@tinloof/sanity-document-options": minor
---

Add custom document ID support for singleton documents\*\*

Singletons now accept an optional `id` parameter to customize the document ID instead of defaulting to the schema type name.

```ts
structureOptions: {
  singleton: {
    id: "custom-document-id",
  },
}
```

This applies to both regular and localized singletons.
