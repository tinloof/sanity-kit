---
"@tinloof/sanity-next": minor
---

Add streamlined draft mode support for Next.js App Router

- New `defineEnableDraftMode` export from `initSanity()` for one-liner API route setup
- Automatic token management - no need to pass tokens in route files
- Draft route handler is always defined, returns helpful errors when not configured

Example usage:

```tsx
// app/api/draft/route.ts
export {defineEnableDraftMode as GET} from "@/data/sanity/client";
```
