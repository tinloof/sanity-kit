---
"@tinloof/sanity-next": minor
---

Add streamlined draft mode support for Next.js App Router

- New `draftRoute` export from `initSanity()` for one-liner API route setup
- Automatic token management - no need to pass tokens in route files
- Added optional `viewerToken` config option to `initSanity()`
- Draft route handler is always defined, returns helpful errors when not configured

Example usage:

```tsx
// app/api/draft/route.ts
import {draftRoute} from "@/data/sanity/client";
export const {GET} = draftRoute;
```
