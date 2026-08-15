import type {defineLive} from "next-sanity/live";

/**
 * next-sanity renamed its live types between majors: 12 exports them as
 * `DefinedSanityFetchType` / `DefineSanityLiveOptions`, 13 as `DefinedFetchType` /
 * `DefineLiveOptions`, and neither major exports the other's spelling. `defineLive`
 * is the one value both export under the same name, so deriving the types from it
 * lets a single build serve the whole `^12.1.0 || ^13.0.0` peer range.
 *
 * next-sanity 13 overloads `defineLive` on `strict`, declaring the strict
 * signature first and the non-strict one last. `Parameters` and `ReturnType`
 * resolve to the last overload, so both land on the non-strict flavour — the only
 * one whose `sanityFetch` the helpers in this package accept. next-sanity 12 has a
 * single signature and no `strict`, so the same derivation works there unchanged.
 *
 * A compile-time assertion in this module's source fails the build if that
 * ordering ever changes.
 */
export type DefinedFetchType = ReturnType<typeof defineLive>["sanityFetch"];

/** @see {@link DefinedFetchType} for why this is derived rather than imported. */
export type DefineLiveOptions = Parameters<typeof defineLive>[0];

type AssertTrue<T extends true> = T;

/**
 * Tripwire for the one way the derivation above can go wrong quietly.
 *
 * If next-sanity ever reorders `defineLive`'s overloads so the `strict: true`
 * signature comes last, `DefineLiveOptions` and `DefinedFetchType` would silently
 * retype to the strict flavour rather than failing to compile. This assertion
 * turns that into a build error here, in `tsc --noEmit`, which `prepublishOnly`
 * runs before anything ships.
 *
 * It cannot fire in a consumer's build: the derivation is emitted textually into
 * `dist/client/init.d.ts` and resolved against whichever next-sanity they have,
 * and `skipLibCheck` hides declaration files in practically every Next app. This
 * catches the reorder the next time we typecheck against the offending version.
 */
export type _NonStrictOverloadGuard = AssertTrue<
	DefineLiveOptions extends {strict: true} ? false : true
>;
