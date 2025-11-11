---
"@tinloof/sanity-document-options": major
---

**Initial release of @tinloof/sanity-document-options**

A powerful Sanity plugin that enables document schemas to configure their own document actions, badges, new document options, and templates directly within the schema definition.

## Features

### 🎯 Document Actions

Configure custom actions or filter existing ones per document type using the `actions` option in your document schema. Support for both function-based resolvers and array-based configurations.

### 🏷️ Document Badges

Add custom badges or modify existing ones based on document state using the `badges` option. Perfect for showing status indicators, warnings, or custom metadata.

### 📄 New Document Options

Control which templates appear in the "Create new document" interface using the `newDocumentOptions` configuration. Filter or modify available templates based on user roles or other conditions.

### 📝 Schema Templates

Define initial value templates directly in document schemas using the `templates` option. Create preset configurations for different document variations.

## Breaking Changes

This is an initial release, so there are no breaking changes from previous versions.

## Usage

Install the plugin and add it to your Sanity config:

```ts
import {documentOptionsPlugin} from "@tinloof/sanity-document-options";

export default defineConfig({
  plugins: [documentOptionsPlugin],
});
```

Then configure your document schemas:

```ts
defineType({
  name: "post",
  type: "document",
  options: {
    document: {
      actions: (prev, context) => {
        // Custom action logic
        return prev.filter((action) => action.action !== "delete");
      },
      badges: (prev, context) => [...prev, {label: "Draft", color: "warning"}],
    },
    schema: {
      templates: [
        {
          id: "blog-post",
          title: "Blog Post Template",
          value: {category: "blog"},
        },
      ],
    },
  },
});
```

## Migration

No migration needed as this is the initial release.
