# @tinloof/sanity-next

## 1.1.0

### Minor Changes

- 0471b72: Add streamlined draft mode support for Next.js App Router
  - New `defineEnableDraftMode` export from `initSanity()` for one-liner API route setup
  - Automatic token management - no need to pass tokens in route files
  - Draft route handler is always defined, returns helpful errors when not configured

  Example usage:

  ```tsx
  // app/api/draft/route.ts
  export {defineEnableDraftMode as GET} from "@/data/sanity/client";
  ```

## 1.0.1

### Patch Changes

- 0fb1b20: Update dependencies to latest versions
  - Update Sanity packages to latest stable versions
  - Update Next.js and React dependencies
  - Update TypeScript and build tooling dependencies
  - Fix component type definitions for improved TypeScript compatibility
  - Remove deprecated eslint configuration

## 1.0.0

### Major Changes

- ee5b6ab: Add @tinloof/sanity-next package with utilities and components for Next.js and Sanity integration
