---
"@tinloof/sanity-studio": minor
"sanity-basic-studio": minor
---

Add `sectionsBodyArraySchema` function for creating sections body array fields

This new function provides a convenient way to create array fields for sections in Sanity Studio documents. It supports both synchronous and asynchronous operation modes with a simplified API for customizable preview images.

**⚠️ Compatibility Notice:** The async version (without `sections` parameter) only works in standalone Sanity Studio projects. It is **not compatible** with embedded setups (e.g., Sanity Studio embedded in Next.js apps) as it depends on Vite's build system and `import.meta.glob()` functionality. For embedded setups, provide the `sections` array directly.

## Features

- **Parameterless usage**: Call `await sectionsBodyArraySchema()` with no parameters for default behavior
- **Dynamic section import**: Automatically imports all available section schemas when no sections are provided
- **Simple preview image configuration**: Pass a function to customize image URLs for section insert menus
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

// With custom preview image function
export default defineType({
  name: "page",
  type: "document",
  fields: [
    await sectionsBodyArraySchema({
      previewImage: (type) =>
        `/static/sections/${type.replace("section.", "")}.png`,
    }),
  ],
});
```
