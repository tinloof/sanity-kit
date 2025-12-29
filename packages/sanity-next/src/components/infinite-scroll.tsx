"use client";

import type {ClientReturn, QueryParams, SanityClient} from "@sanity/client";
import type {ReactNode} from "react";
import type {SWRInfiniteConfiguration} from "swr/infinite";
import {
	InfiniteScroll as InfiniteScrollBase,
	type InfiniteScrollRenderProps,
} from "./infinite-scroll-base";

/**
 * Options for the Intersection Observer used for auto-loading.
 */
type IntersectionOptions = {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number;
};

/**
 * Simplified props for the opinionated InfiniteScroll component.
 */
export type InfiniteScrollProps<
	TQuery extends string,
	TResult = ClientReturn<TQuery>,
> = {
	/** The Sanity client instance to use for fetching */
	client: SanityClient;
	/** The GROQ query to execute */
	query: TQuery;
	/** Initial data for SSR hydration (first page) */
	initialData: TResult | null;
	/** Number of entries per page */
	pageSize: number;
	/**
	 * Additional params to include in the query (besides pagination).
	 * These will be merged with the pagination params.
	 */
	params?: Record<string, unknown>;
	/**
	 * The key in the query result that contains the entries array.
	 * @default "entries"
	 */
	entriesKey?: string;
	/**
	 * The key in the query result that contains the total count.
	 * @default "entriesCount"
	 */
	countKey?: string;
	/**
	 * Custom hasMore logic. If not provided, uses default based on entriesKey and countKey.
	 */
	hasMore?: (pages: TResult[]) => boolean;
	/**
	 * Render function that receives the infinite scroll state.
	 */
	children: (props: InfiniteScrollRenderProps<TResult>) => ReactNode;
	/**
	 * Whether to automatically load more when the trigger element is in view.
	 * @default true
	 */
	autoLoad?: boolean;
	/**
	 * Options for the Intersection Observer used for auto-loading.
	 */
	intersectionOptions?: IntersectionOptions;
	/** SWR infinite configuration options */
	swrOptions?: SWRInfiniteConfiguration;
};

// Re-export render props type for convenience
export type {InfiniteScrollRenderProps};

// Re-export base component for advanced use cases
export {InfiniteScrollBase};

/**
 * An opinionated infinite scroll component for Sanity data with sensible defaults.
 *
 * This is a simpler wrapper around `InfiniteScrollBase` that handles common patterns:
 * - Automatic pagination params generation
 * - Default page merging strategy
 * - Default hasMore detection based on entry count
 *
 * ## Query Structure
 *
 * Your GROQ query should be structured to support pagination with the following params:
 * - `$pageStart` - The starting index (0-based)
 * - `$pageEnd` - The ending index (exclusive)
 * - `$pageNumber` - The current page number (0-based)
 * - `$entriesPerPage` - The number of entries per page
 *
 * The query result should include:
 * - An array of entries (default key: `"entries"`, configurable via `entriesKey`)
 * - A total count (default key: `"entriesCount"`, configurable via `countKey`)
 *
 * ### Example Query
 *
 * ```groq
 * {
 *   "entries": *[_type == "post"] | order(publishedAt desc) [$pageStart...$pageEnd] {
 *     _id,
 *     title,
 *     slug,
 *     publishedAt
 *   },
 *   "entriesCount": count(*[_type == "post"])
 * }
 * ```
 *
 * ### Query with Filters
 *
 * ```groq
 * {
 *   "entries": *[_type == "post" && ($filterTag == null || $filterTag in tags[]->slug.current)]
 *     | order(publishedAt desc) [$pageStart...$pageEnd] {
 *     _id,
 *     title,
 *     slug
 *   },
 *   "entriesCount": count(*[_type == "post" && ($filterTag == null || $filterTag in tags[]->slug.current)])
 * }
 * ```
 *
 * @example Basic usage
 * ```tsx
 * <InfiniteScroll
 *   client={sanityClient}
 *   query={POSTS_QUERY}
 *   initialData={initialData}
 *   pageSize={10}
 * >
 *   {({ data, hasMore, ref }) => (
 *     <>
 *       <div className="grid">
 *         {data?.entries?.map((post) => (
 *           <PostCard key={post._id} post={post} />
 *         ))}
 *       </div>
 *       {hasMore && <div ref={ref}>Loading more...</div>}
 *     </>
 *   )}
 * </InfiniteScroll>
 * ```
 *
 * @example With additional params
 * ```tsx
 * <InfiniteScroll
 *   client={sanityClient}
 *   query={BLOG_INDEX_QUERY}
 *   initialData={initialData}
 *   pageSize={10}
 *   params={{ filterTag: tagParam ?? null }}
 * >
 *   {({ data, hasMore, ref, loadMore }) => (
 *     <>
 *       <div className="grid">
 *         {data?.entries?.map((post) => (
 *           <PostCard key={post._id} post={post} />
 *         ))}
 *       </div>
 *       {hasMore && (
 *         <button onClick={loadMore}>Load More</button>
 *       )}
 *     </>
 *   )}
 * </InfiniteScroll>
 * ```
 *
 * @example With custom entry keys
 * ```tsx
 * // For a query that returns { products: [...], totalProducts: 100 }
 * <InfiniteScroll
 *   client={sanityClient}
 *   query={PRODUCTS_QUERY}
 *   initialData={initialData}
 *   pageSize={12}
 *   entriesKey="products"
 *   countKey="totalProducts"
 * >
 *   {({ data, hasMore, loadMore }) => (
 *     // ...
 *   )}
 * </InfiniteScroll>
 * ```
 *
 * ```
 *
 * For more advanced use cases with full control over params, select, and hasMore logic,
 * use `InfiniteScrollBase` directly:
 *
 * ```tsx
 * import { InfiniteScrollBase } from "@tinloof/sanity-next/components/infinite-scroll-base";
 * ```
 */
export function InfiniteScroll<
	const TQuery extends string,
	TResult = ClientReturn<TQuery>,
>({
	client,
	query,
	initialData,
	pageSize,
	params: additionalParams,
	entriesKey = "entries",
	countKey = "entriesCount",
	hasMore: customHasMore,
	children,
	autoLoad = true,
	intersectionOptions,
	swrOptions,
}: InfiniteScrollProps<TQuery, TResult>) {
	return (
		<InfiniteScrollBase
			client={client}
			query={query}
			initialData={initialData as any}
			autoLoad={autoLoad}
			intersectionOptions={intersectionOptions}
			swrOptions={swrOptions}
			params={({previousPageData}, {paginationParams}) => {
				// Check if we've reached the end based on previous page
				if (previousPageData) {
					const entries = (previousPageData as Record<string, unknown>)[
						entriesKey
					];
					if (Array.isArray(entries) && entries.length < pageSize) {
						return null;
					}
				}

				return {
					...paginationParams({pageSize}),
					...additionalParams,
				};
			}}
			select={(pages, {mergePages}) => mergePages(pages, {entriesKey})}
			hasMore={
				customHasMore ??
				((pages: unknown[]) => {
					const allEntries = pages.flatMap(
						(p) =>
							((p as Record<string, unknown>)?.[entriesKey] as unknown[]) ?? [],
					);
					const lastPage = pages[pages.length - 1] as
						| Record<string, unknown>
						| undefined;
					const totalCount = (lastPage?.[countKey] as number) ?? 0;
					return allEntries.length < totalCount;
				})
			}
		>
			{children as any}
		</InfiniteScrollBase>
	);
}
