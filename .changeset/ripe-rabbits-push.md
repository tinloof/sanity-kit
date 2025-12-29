---
"@tinloof/sanity-studio": minor
---

Add portable text field factory for reusable content configurations

## New Utilities

### Portable Text Factory

- `definePortableTextFactory`: A factory function that creates project-specific portable text field builders with predefined registries of styles, blocks, decorators, lists, annotations, and inner blocks

This eliminates repetitive portable text configuration by defining your content blocks once and reusing them across schemas with type-safe key selection.

**Key Features:**

- Define content blocks once in a central registry
- Reference blocks by key when creating fields
- Full TypeScript support with autocomplete for registry keys
- Automatic filtering of selected items from registry
- Support for all portable text features: styles (h1-h6, blockquote), decorators (bold, italic, code), lists (bullet, number), blocks (images, code blocks), annotations (links), and inner blocks (inline elements)

### Default Registries

Export pre-configured defaults for common portable text elements:

- `defaultPTStyles`: Normal, H1-H6, and blockquote styles
- `defaultPTLists`: Bullet and numbered list types
- `defaultPTDecorators`: Strong, emphasis, underline, strike-through, and code decorators

### Additional Utilities

- `isUnique`: Validation helper for ensuring field uniqueness across documents

## Example Usage

```ts
// Define your registry once
export const createPtBody = definePortableTextFactory({
  styles: {
    normal: {title: "Normal", value: "normal"},
    h2: {title: "Heading 2", value: "h2"},
    h3: {title: "Heading 3", value: "h3"},
  },
  blocks: {
    image: defineField({ type: "image", name: "image" }),
    code: defineField({ type: "code", name: "code" }),
  },
  annotations: {
    link: defineField({ name: "link", type: "object", fields: [...] }),
  },
});

// Use it across schemas
defineField({
  ...createPtBody({
    styles: ["normal", "h2", "h3"],
    blocks: ["image"],
    annotations: ["link"],
  }),
})
```
