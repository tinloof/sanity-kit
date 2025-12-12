---
"@tinloof/sanity-studio": minor
---

Added `isUnique` validation utility for checking slug uniqueness across documents.

The new `isUnique` helper function provides a configurable way to validate that slug values are unique in your Sanity dataset. It supports:

- Custom field paths (defaults to `pathname.current`)
- Additional GROQ filters for document type or locale filtering
- Configurable API version

Example usage:

```tsx
import {isUnique} from "@tinloof/sanity-studio/utils";

{
  name: "slug",
  type: "slug",
  options: {
    source: "title",
    isUnique: (value, context) =>
      isUnique(value, context, {
        fieldPath: "slug.current",
        filter: '_type == "blog.tag"',
      }),
  },
}
```
