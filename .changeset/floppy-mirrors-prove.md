---
"@tinloof/sanity-next": minor
---

Add `loadMoreHandler` to `initSanity` for simplified pagination API routes

This release introduces a pre-configured `loadMoreHandler` that's automatically available when you initialize Sanity with `initSanity()`. This handler works seamlessly with the `useInfiniteLoad` and `useInfiniteScroll` hooks to enable infinite scrolling patterns.

**Key Features:**

- Automatically configured with your `sanityFetch` function
- No manual setup required - just export it from your API route
- Type-safe integration with Sanity queries
- Automatic error handling and response formatting
- Works with any paginated Sanity query

**Example Usage:**

```ts
// lib/sanity/client.ts
import { initSanity } from "@tinloof/sanity-next/client/init";

export const {
  sanityFetch,
  loadMoreHandler, // Pre-configured handler ready to use
  // ... other utilities
} = initSanity();
```

```ts
// app/api/load-more/route.ts
export { loadMoreHandler as POST } from "@/lib/sanity/client";
export const maxDuration = 60;
```

That's it! The handler is ready to work with `useInfiniteLoad` and `useInfiniteScroll` hooks.

The handler accepts POST requests with:

- `query`: The GROQ query to execute
- `params`: Query parameters including pagination params

Returns a JSON response with:

- `data`: The query result
- `success`: Boolean indicating success/failure
- `error`: Error message (only on failure)

See the blog-next example for a complete implementation with infinite scroll.
