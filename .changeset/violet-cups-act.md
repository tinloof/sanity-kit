---
"@tinloof/sanity-studio": minor
---

Add `newDocumentOptions` configuration option to `defineDocument` and `definePage` to control document creation visibility. This option controls whether a document type appears in the new document creation menu, including the global Create button and the create button that appears in reference fields. Supports boolean values (true/false) or role-based access control via an array of role names.

To enable this feature, add the `defineNewDocumentOptions` resolver to your Sanity Studio configuration:

```tsx
import {defineNewDocumentOptions} from "@tinloof/sanity-studio";

export default defineConfig({
  document: {
    newDocumentOptions: defineNewDocumentOptions,
  },
});
```

For more details, see the [Sanity Documentation: New Document Options](https://www.sanity.io/docs/studio/new-document-options#dd286e30bb2e).
