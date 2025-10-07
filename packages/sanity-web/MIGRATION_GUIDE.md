# Migration Guide: Restructured Exports

This guide explains the new export structure and how to migrate your existing imports.

## New Export Structure

The package now supports both top-level imports and deep imports following popular Next.js library patterns:

### Top-level Imports (Backward Compatible)

```typescript
// These continue to work as before
import {SanityImage, ExitPreview} from "@tinloof/sanity-web";
import {getRedirect, handleRedirect} from "@tinloof/sanity-web";
import {generateSanitySitemap} from "@tinloof/sanity-web";
```

### New Subpath Exports

#### Components

```typescript
// Import components
import {SanityImage, ExitPreview} from "@tinloof/sanity-web/components";
import {SanityImage} from "@tinloof/sanity-web/components/sanity-image";
import {ExitPreview} from "@tinloof/sanity-web/components/exit-preview";
```

#### Server Utilities

```typescript
// Import server utilities
import {generateSanitySitemap} from "@tinloof/sanity-web/server";
```

#### Middleware Utilities

```typescript
// Import middleware utilities
import {handleRedirect} from "@tinloof/sanity-web/middleware";
```

#### Shared Utilities

```typescript
// Import shared utilities
import {slugify, formatPath} from "@tinloof/sanity-web/utils";
import {slugify} from "@tinloof/sanity-web/utils/urls";
import {truncate} from "@tinloof/sanity-web/utils/strings";
import {getPtComponentId} from "@tinloof/sanity-web/utils/portable-text";
import {getRedirect} from "@tinloof/sanity-web/utils/redirects";
```

#### Types

```typescript
// Import types
import type {SanityImageProps, DocForPath} from "@tinloof/sanity-web/types";
```

#### GROQ Fragments

```typescript
// Import fragments
import {TRANSLATIONS_FRAGMENT} from "@tinloof/sanity-web/fragments";
```

## Migration Examples

### Before (Current)

```typescript
import {SanityImage, ExitPreview} from "@tinloof/sanity-web";
import {getRedirect, handleRedirect} from "@tinloof/sanity-web";
import {generateSanitySitemap} from "@tinloof/sanity-web";
```

### After (Recommended)

```typescript
// Components
import {SanityImage, ExitPreview} from "@tinloof/sanity-web/components";

// Server utilities
import {generateSanitySitemap} from "@tinloof/sanity-web/server";

// Middleware utilities
import {handleRedirect} from "@tinloof/sanity-web/middleware";

// Or use deep imports for better tree-shaking
import {SanityImage} from "@tinloof/sanity-web/components/sanity-image";
import {getRedirect} from "@tinloof/sanity-web/utils/redirects";
```

## Benefits of New Structure

### 1. **Better Tree-shaking**

- Deep imports allow bundlers to eliminate unused code more effectively
- Smaller bundle sizes for production builds

### 2. **Clear Separation of Concerns**

- Client vs Server utilities are clearly separated
- Middleware utilities are isolated
- Types and fragments have dedicated exports

### 3. **Next.js App Router Compatibility**

- Client components are properly marked with `'use client'`
- Server utilities can be safely imported in server components
- Middleware utilities are optimized for Next.js middleware

### 4. **Lodash-style Deep Imports**

- Import only what you need: `import { slugify } from '@tinloof/sanity-web/utils/urls'`
- Better IDE support and autocomplete
- Clearer dependency tracking

## Trade-offs

### Advantages

- ✅ **Better tree-shaking**: Smaller bundle sizes
- ✅ **Clearer separation**: Client vs server code is obvious
- ✅ **Next.js compatibility**: Proper `'use client'` directives
- ✅ **Flexible imports**: Both top-level and deep imports supported
- ✅ **Future-proof**: Easy to add new utilities without breaking changes
- ✅ **Type safety**: Full TypeScript support maintained

### Considerations

- ⚠️ **Learning curve**: Developers need to understand the new import patterns
- ⚠️ **Migration effort**: Existing code needs to be updated (though old imports still work)
- ⚠️ **Bundle complexity**: More entry points to manage during build

## Breaking Changes

**None!** The main entry point (`@tinloof/sanity-web`) continues to export everything for backward compatibility.

## Recommended Migration Strategy

1. **Phase 1**: Continue using existing imports (no changes needed)
2. **Phase 2**: Gradually migrate to subpath imports for better tree-shaking
3. **Phase 3**: Use deep imports for maximum optimization

## Example Migration

### Current Code

```typescript
// pages/api/sitemap.ts
import {generateSanitySitemap} from "@tinloof/sanity-web";

// middleware.ts
import {handleRedirect} from "@tinloof/sanity-web";

// components/Image.tsx
import {SanityImage} from "@tinloof/sanity-web";
```

### Optimized Code

```typescript
// pages/api/sitemap.ts
import {generateSanitySitemap} from "@tinloof/sanity-web/server";

// middleware.ts
import {handleRedirect} from "@tinloof/sanity-web/middleware";

// components/Image.tsx
import {SanityImage} from "@tinloof/sanity-web/client";
```

This structure provides the best of both worlds: backward compatibility with the flexibility to optimize imports for better performance.
