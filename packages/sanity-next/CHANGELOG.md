# @tinloof/sanity-next

## 2.0.0

### Major Changes

- abca273: **BREAKING CHANGE**: Updated peer dependencies to require Sanity v5, React 19.2.3+, Next.js 16.0.10+, and next-sanity v12.

  These minimum versions are required due to:
  - Sanity v5 dropping support for React < 19.2
  - next-sanity v12 requiring Next.js 16 and React 19.2
  - Critical security vulnerabilities (CVE-2025-55182, CVE-2025-67779) in earlier versions of React and Next.js

### Patch Changes

- 6a563a4: Support URL strings for ogImage in resolveSanityRouteMetadata

## 1.3.0

### Minor Changes

- 947c643: Add infinite scroll components, hooks, and utilities for enhanced Next.js integration

  ## New Components

  ### Infinite Scroll Components
  - `InfiniteScroll`: Opinionated infinite scroll component with automatic pagination parameter generation and sensible defaults for Sanity queries
  - `InfiniteScrollBase`: Lower-level infinite scroll component with full control over params, select, and hasMore logic for advanced use cases

  Both components support:
  - Automatic loading when scrolling (with Intersection Observer)
  - Manual "Load More" button triggering
  - SSR with initial data hydration
  - Custom intersection observer options

  ### UI Components
  - `SanityImage`: Standalone image component (previously only available through `initSanity`)

  ## New Hooks
  - `useInfiniteQuery`: SWR-based hook for infinite loading of Sanity data with type-safe query inference, pagination helpers (`paginationParams`), and result merging utilities (`mergePages`)
  - `useInView`: Intersection Observer hook for detecting when elements enter viewport (used internally by infinite scroll components)

  ## New Utilities
  - `createClient`: Factory function for creating Sanity clients with environment variable defaults and TypeScript-friendly configuration

  ## New Exports

  Added the following package exports:
  - `@tinloof/sanity-next/client/create-client`
  - `@tinloof/sanity-next/components/sanity-image`
  - `@tinloof/sanity-next/hooks`
  - `@tinloof/sanity-next/components/infinite-scroll`
  - `@tinloof/sanity-next/components/infinite-scroll-base`

  ## Dependencies
  - Add `@portabletext/react` (^6.0.0)
  - Add `@portabletext/types` (^4.0.0)
  - Add `swr` (^2.3.8)

### Patch Changes

- cc1b86d:

## 1.2.0

### Minor Changes

- 105e9c3: fix(sanity-next): pass authenticated client to `defineLive` when custom `live` config is provided\*\*

  When passing a custom `live` config to `initSanity()`, `sanityFetch` was broken because the client passed to `defineLive` wasn't configured with the token.

  Now we pass `client.withConfig({ token: sanity_api_token })` to `defineLive`, consistent with how the default branch handles it.

## 1.1.0

### Minor Changes

- 0471b72: Add streamlined draft mode support for Next.js App Router
  - New `defineEnableDraftMode` export from `initSanity()` for one-liner API route setup
  - Automatic token management - no need to pass tokens in route files
  - Draft route handler is always defined, returns helpful errors when not configured

  Example usage:

  ```tsx
  // app/api/draft/route.ts
  export { defineEnableDraftMode as GET } from "@/data/sanity/client";
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
