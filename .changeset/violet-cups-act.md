---
"@tinloof/sanity-studio": minor
---

Add document template utilities for controlling document creation visibility in Sanity Studio. These utilities extend Sanity's existing `newDocumentOptions` API, allowing you to restrict when and where document types can be created based on creation context and user roles.

**New utilities:**

- `newDocumentOptionsRemove(contexts, schemaName)` - Remove document template from specific creation contexts
- `newDocumentOptionsRemoveByRole(schemaName, roleContextMap)` - Remove document template based on user roles and contexts

**Setup:**

Add the `defineNewDocumentOptions` resolver to your Sanity Studio configuration:

```tsx
import {defineNewDocumentOptions} from "@tinloof/sanity-studio";

export default defineConfig({
  document: {
    newDocumentOptions: defineNewDocumentOptions,
  },
});
```

**Usage examples:**

Basic utility usage:

```tsx
import {
  defineDocument,
  newDocumentOptionsRemove,
  newDocumentOptionsRemoveByRole,
} from "@tinloof/sanity-studio";

export default defineDocument({
  name: "blogPost",
  title: "Blog Post",
  options: {
    newDocumentOptions: newDocumentOptionsRemoveByRole("blogPost", {
      contributor: ["global"], // Contributors cannot create from global menu
      editor: ["document"], // Editors cannot create from within documents
    }),
  },
  fields: [
    // Your fields
  ],
});
```

Combining with existing Sanity API:

```tsx
export default defineDocument({
  name: "blogPost",
  title: "Blog Post",
  options: {
    newDocumentOptions: (prev, context) => {
      // Use native Sanity filtering first
      let filtered = prev.filter((item) => item.templateId !== "blogPost");

      // Add conditional logic
      if (context.currentUser?.roles?.[0]?.name === "editor") {
        const template = prev.find((item) => item.templateId === "blogPost");
        if (template) filtered.push(template);
      }

      // Apply utility-based filtering
      return newDocumentOptionsRemoveByRole("blogPost", {
        contributor: ["global"],
      })(filtered, context);
    },
  },
});
```

Creation contexts include `"global"` (global Create button), `"structure"` (Structure tool), and `"document"` (creating from within documents/references).
