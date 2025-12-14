---
"@tinloof/sanity-studio": minor
---

Add `definePortableTextFactory` utility for creating reusable portable text field configurations

This release introduces a powerful factory function that allows you to define portable text configurations once and reuse them across your schema. Instead of manually defining blocks, annotations, and styles for every field, you can create a registry and reference items by key.

**Key Features:**

- Define styles, blocks, decorators, lists, annotations, and inner blocks in a central registry
- Reuse configurations across multiple document types
- Type-safe with full TypeScript support
- Reduces code duplication and ensures consistency

**Example Usage:**

```ts
// helpers/create-pt-body.ts
import { definePortableTextFactory } from "@tinloof/sanity-studio/utils";

export const createPtBody = definePortableTextFactory({
  styles: {
    normal: { title: "Normal", value: "normal" },
    h1: { title: "Heading 1", value: "h1" },
    h2: { title: "Heading 2", value: "h2" },
  },
  decorators: {
    strong: { title: "Strong", value: "strong" },
    em: { title: "Emphasis", value: "em" },
  },
  blocks: {
    image: defineField({
      type: "image",
      name: "imagePtBlock",
      fields: [
        defineField({ name: "alt", type: "string" }),
        defineField({ name: "caption", type: "string" }),
      ],
    }),
  },
  annotations: {
    link: defineField({
      name: "link",
      type: "object",
      fields: [defineField({ name: "url", type: "string" })],
    }),
  },
});

// In your schema
export default defineType({
  name: "post",
  type: "document",
  fields: [
    defineField({
      ...createPtBody({
        styles: ["normal", "h2"],
        decorators: ["strong", "em"],
        blocks: ["image"],
        annotations: ["link"],
      }),
    }),
  ],
});
```

See the blog example for a complete implementation.
