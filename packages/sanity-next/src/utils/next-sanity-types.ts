import type {defineLive} from "next-sanity/live";

/**
 * next-sanity renamed its live types between majors: 12 exports them as
 * `DefinedSanityFetchType` / `DefineSanityLiveOptions`, 13 as `DefinedFetchType` /
 * `DefineLiveOptions`, and neither major exports the other's spelling. `defineLive`
 * is the one value both export under the same name, so deriving the types from it
 * lets a single build serve the whole `^12.4.1 || ^13.0.0` peer range.
 *
 * next-sanity 13 overloads `defineLive` on `strict`. `Parameters` and `ReturnType`
 * resolve to its last overload, which is the non-strict one — the only flavour
 * whose `sanityFetch` the helpers in this package accept.
 */
export type DefinedFetchType = ReturnType<typeof defineLive>["sanityFetch"];

/** @see {@link DefinedFetchType} for why this is derived rather than imported. */
export type DefineLiveOptions = Parameters<typeof defineLive>[0];
