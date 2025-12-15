"use client";

import type {ClientReturn} from "@sanity/client";
import type {ReactNode, Ref} from "react";
import {useEffect} from "react";
import {useInView} from "../hooks/use-in-view";
import {
	type UseSanityInfiniteQueryOptions,
	useInfiniteQuery,
} from "../hooks/use-infinite-query";

/**
 * Options for the Intersection Observer used for auto-loading.
 */
type IntersectionOptions = {
	root?: Element | null;
	rootMargin?: string;
	threshold?: number;
};

/**
 * Render props passed to the children function
 */
export type InfiniteScrollRenderProps<TSelected> = {
	/** The merged/selected data from all loaded pages */
	data: TSelected | undefined;
	/** Whether the first page is loading */
	isLoading: boolean;
	/** Whether any page is currently being fetched */
	isValidating: boolean;
	/** Whether there are more pages to load */
	hasMore: boolean;
	/** Function to manually trigger loading more */
	loadMore: () => void;
	/** Ref to attach to a trigger element for automatic loading */
	ref: Ref<HTMLDivElement>;
	/** Whether the trigger element is in view */
	inView: boolean;
};

/**
 * Props for the InfiniteScroll component.
 * Extends all options from useInfiniteQuery plus component-specific props.
 */
export type InfiniteScrollProps<
	TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
> = UseSanityInfiniteQueryOptions<TQuery, TParams, TSelected> & {
	/**
	 * Render function that receives the infinite scroll state.
	 */
	children: (props: InfiniteScrollRenderProps<TSelected>) => ReactNode;
	/**
	 * Whether to automatically load more when the trigger element is in view.
	 * @default true
	 */
	autoLoad?: boolean;
	/**
	 * Options for the Intersection Observer used for auto-loading.
	 */
	intersectionOptions?: IntersectionOptions;
};

/**
 * A component for infinite scrolling with Sanity data using render props.
 *
 * Combines `useInfiniteQuery` and `useInView` to provide automatic or manual
 * infinite loading with a flexible render props API.
 *
 * @example Basic usage with auto-loading
 * ```tsx
 * <InfiniteScroll
 *   client={sanityClient}
 *   query={BLOG_INDEX_QUERY}
 *   initialData={initialData}
 *   params={({ previousPageData }, { paginationParams }) => {
 *     if (previousPageData?.entries?.length < pageSize) return null;
 *     return {
 *       ...paginationParams({ pageSize }),
 *       filterTag: null,
 *     };
 *   }}
 *   select={(pages, { mergePages }) => mergePages(pages)}
 * >
 *   {({ data, isLoading, hasMore, ref }) => (
 *     <>
 *       <div className="grid">
 *         {data?.entries?.map((post) => (
 *           <PostCard key={post._id} post={post} />
 *         ))}
 *       </div>
 *       {hasMore && <div ref={ref}>Loading more...</div>}
 *       {isLoading && <Spinner />}
 *     </>
 *   )}
 * </InfiniteScroll>
 * ```
 *
 * @example Manual loading with button
 * ```tsx
 * <InfiniteScroll
 *   client={sanityClient}
 *   query={BLOG_INDEX_QUERY}
 *   initialData={initialData}
 *   autoLoad={false}
 *   params={({ previousPageData }, { paginationParams }) => {
 *     if (previousPageData?.entries?.length < pageSize) return null;
 *     return paginationParams({ pageSize });
 *   }}
 *   select={(pages, { mergePages }) => mergePages(pages)}
 * >
 *   {({ data, isValidating, hasMore, loadMore }) => (
 *     <>
 *       <div className="grid">
 *         {data?.entries?.map((post) => (
 *           <PostCard key={post._id} post={post} />
 *         ))}
 *       </div>
 *       {hasMore && (
 *         <button onClick={loadMore} disabled={isValidating}>
 *           {isValidating ? "Loading..." : "Load More"}
 *         </button>
 *       )}
 *     </>
 *   )}
 * </InfiniteScroll>
 * ```
 *
 * @example Without initial data (fetches on mount)
 * ```tsx
 * <InfiniteScroll
 *   client={sanityClient}
 *   query={BLOG_INDEX_QUERY}
 *   params={(_, { paginationParams }) => paginationParams({ pageSize: 10 })}
 *   select={(pages, { mergePages }) => mergePages(pages)}
 * >
 *   {({ data, isLoading, hasMore, ref }) => (
 *     <>
 *       {isLoading && !data ? (
 *         <Spinner />
 *       ) : (
 *         <>
 *           <div className="grid">
 *             {data?.entries?.map((post) => (
 *               <PostCard key={post._id} post={post} />
 *             ))}
 *           </div>
 *           {hasMore && <div ref={ref}>Loading more...</div>}
 *         </>
 *       )}
 *     </>
 *   )}
 * </InfiniteScroll>
 * ```
 */
export function InfiniteScroll<
	const TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
>({
	children,
	autoLoad = true,
	intersectionOptions,
	...queryOptions
}: InfiniteScrollProps<TQuery, TParams, TSelected>) {
	const {data, isLoading, isValidating, hasMore, loadMore} = useInfiniteQuery<
		TQuery,
		TParams,
		TSelected
	>(queryOptions as any);

	const {inView, ref} = useInView(intersectionOptions);

	// Auto-load when trigger element comes into view
	useEffect(() => {
		if (autoLoad && inView && hasMore && !isValidating) {
			console.debug("load more");
			loadMore();
		}
	}, [autoLoad, inView, hasMore, isValidating, loadMore]);

	return children({
		data,
		isLoading,
		isValidating,
		hasMore,
		loadMore,
		ref,
		inView,
	});
}
