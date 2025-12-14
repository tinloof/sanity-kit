---
"@tinloof/sanity-web": minor
---

Add type-safe `RichText` component and portable text utilities

This release introduces a powerful type-safe component for rendering Sanity Portable Text with automatic TypeScript inference from your Sanity schema.

**`RichText` Component:**

- Full type safety derived from Sanity typegen
- Automatic heading slug generation for anchor links
- Custom component support for blocks, marks, lists, and types
- Seamless integration with `@portabletext/react`

**Portable Text Type Utilities:**

- `ExtractPtBlockType`: Extract custom block type names from PT arrays
- `ExtractPtBlock`: Get typed props for specific block types
- Helper types for type-safe component development

**Example Usage:**

```tsx
import { RichText } from "@tinloof/sanity-web/components/rich-text";
import type { BLOG_POST_QUERYResult } from "./sanity.types";

type PTBody = NonNullable<BLOG_POST_QUERYResult>["ptBody"];

function BlogPost({ data }: { data: BLOG_POST_QUERYResult }) {
  return (
    <RichText<PTBody>
      value={data.ptBody}
      components={{
        block: {
          h2: ({ children }) => <h2 className="text-2xl">{children}</h2>,
        },
        marks: {
          link: ({ children, value }) => <a href={value?.url}>{children}</a>,
        },
        types: {
          imagePtBlock: ({ value }) => <img src={value.asset?._ref} />,
        },
      }}
    />
  );
}
```

**Key Features:**

- Headings (h1-h6) automatically get `id` attributes based on their text content
- User-provided heading components are enhanced with slug IDs
- Zero runtime overhead for type inference
- Compatible with all `@portabletext/react` component options

See the blog-next example for a complete implementation with custom blocks, marks, and styling.
