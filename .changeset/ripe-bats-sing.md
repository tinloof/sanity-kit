---
"@tinloof/sanity-next": minor
---

Add infinite scroll components, hooks, and utilities for enhanced Next.js integration

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
