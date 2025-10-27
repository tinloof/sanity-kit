---
"@tinloof/sanity-studio": minor
"sanity-basic-studio": minor
---

Add `sectionsBodyArraySchema` function for creating sections body array fields

This new function provides a convenient way to create array fields for sections in Sanity Studio documents. It supports both synchronous and asynchronous operation modes, and customizable preview images.

## Features

- **Parameterless usage**: Call `await sectionsBodyArraySchema()` with no parameters for default behavior
- **Dynamic section import**: Automatically imports all available section schemas when no sections are provided
- **Customizable preview images**: Configure image paths and naming conventions for section insert menus
- **Grid view insert menu**: Visual section picker with preview images
- **Type-safe configuration**: Full TypeScript support with proper return types

## Usage

```typescript
import {sectionsBodyArraySchema} from "@tinloof/sanity-studio";

// Basic usage with defaults
export default defineType({
  name: "page",
  type: "document",
  fields: [await sectionsBodyArraySchema()],
});

// With custom preview image configuration
export default defineType({
  name: "page",
  type: "document",
  fields: [
    await sectionsBodyArraySchema({
      options: {
        previewImage: {
          basePath: "/static/sections/",
          extension: ".png",
          stripPrefix: "section.",
        },
      },
    }),
  ],
});
```
