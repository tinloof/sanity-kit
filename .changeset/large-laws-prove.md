---
"@tinloof/sanity-next": minor
---

Add React hooks for infinite scrolling and pagination

This release introduces three new hooks that make implementing infinite scroll and pagination effortless:

**`useInfiniteLoad`** - High-level hook combining infinite scroll with intersection observer

- Automatically loads more data when user scrolls to the bottom
- Provides loading states and page tracking
- Customizable pagination parameters
- Returns a ref to attach to your "load more" trigger element

**`useInfiniteScroll`** - Core pagination logic hook

- Manages paginated data fetching and state
- Accumulates results across page loads
- Configurable API endpoint
- Type-safe with TypeScript generics

**`useInView`** - Intersection Observer hook

- Detects when an element enters the viewport
- Customizable root, rootMargin, and threshold options
- Lightweight wrapper around IntersectionObserver API

**Example Usage:**

```tsx
"use client";
import { useInfiniteLoad } from "@tinloof/sanity-next/hooks";

export function BlogIndex({ initialData }) {
  const { data, hasNextPage, ref } = useInfiniteLoad({
    query: BLOG_INDEX_QUERY,
    initialData,
    additionalParams: {
      entriesPerPage: 12,
    },
  });

  return (
    <div>
      {data?.entries?.map((post) => (
        <article key={post._id}>{post.title}</article>
      ))}
      {hasNextPage && <div ref={ref}>Loading...</div>}
    </div>
  );
}
```

All hooks are fully typed and work seamlessly with the `createLoadMoreHandler` API route helper.

See the blog-next example for complete implementations of infinite scroll patterns.
