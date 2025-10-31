---
"@tinloof/sanity-studio": minor
"sanity-basic-studio": minor
---

Add `sectionsBodyArraySchema` function for creating sections body array fields

This new function provides a convenient way to create array fields for sections in Sanity Studio documents. It operates synchronously and requires a `sections` array to be provided for maximum compatibility across all Sanity Studio setups.

## Features

- **Required sections parameter**: Must provide a `sections` array containing the section schemas to use
- **Simple preview image configuration**: Pass a function to customize image URLs for section insert menus
- **Grid view insert menu**: Visual section picker with preview images
- **Type-safe configuration**: Full TypeScript support with proper return types
- **Universal compatibility**: Works in all Sanity Studio setups (standalone and embedded)

## Usage

```typescript
import {sectionsBodyArraySchema} from "@tinloof/sanity-studio";

// Basic usage
export default defineType({
  name: "page",
  type: "document",
  fields: [
    sectionsBodyArraySchema({
      sections: [
        {name: "hero", title: "Hero Section"},
        {name: "banner", title: "Banner Section"},
      ],
    }),
  ],
});

// With custom preview image function
export default defineType({
  name: "page",
  type: "document",
  fields: [
    sectionsBodyArraySchema({
      sections: [
        {name: "hero", title: "Hero Section"},
        {name: "banner", title: "Banner Section"},
      ],
      previewImage: (type) =>
        `/static/sections/${type.replace("section.", "")}.png`,
    }),
  ],
});
```
