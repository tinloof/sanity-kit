import {useEffect} from "react";
import {
	useInfiniteScroll,
	type PaginatedQueryResult,
} from "./use-infinite-scroll";
import {useInView} from "./use-in-view";

export type {PaginatedQueryResult};

/**
 * Options for the useInfiniteLoad hook
 */
type UseInfiniteLoadOptions<T extends PaginatedQueryResult> = {
	/** The GROQ query to execute for fetching data */
	query: string;
	/** Initial data loaded on the server */
	initialData: T;
	/** Additional parameters to pass to the query */
	additionalParams?: Record<string, any>;
	/** Custom function to calculate total pages from data */
	calculatePagesTotal?: (data: T) => number;
	/** API endpoint for loading more data (default: "/api/load-more") */
	apiEndpoint?: string;
};

/**
 * High-level hook for infinite scrolling with automatic loading
 *
 * Combines infinite scroll logic with intersection observer to automatically
 * load more data when the user scrolls to a trigger element. This is the
 * recommended hook for implementing infinite scroll patterns.
 *
 * @param options - Configuration options
 * @returns Object containing data, pagination state, and ref for trigger element
 *
 * @example
 * ```tsx
 * "use client";
 * import { useInfiniteLoad } from "@tinloof/sanity-next/hooks";
 * import { BLOG_INDEX_QUERY } from "@/sanity/queries";
 *
 * export function BlogIndex({ initialData, entriesPerPage = 12 }) {
 *   const { data, hasNextPage, ref } = useInfiniteLoad({
 *     query: BLOG_INDEX_QUERY,
 *     initialData,
 *     additionalParams: {
 *       entriesPerPage,
 *       filterTag: null,
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {data?.entries?.map((post) => (
 *         <article key={post._id}>{post.title}</article>
 *       ))}
 *       {hasNextPage && (
 *         <div ref={ref}>Loading more...</div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * Custom pagination calculation:
 * ```tsx
 * const { data, hasNextPage, ref } = useInfiniteLoad({
 *   query: BLOG_INDEX_QUERY,
 *   initialData,
 *   calculatePagesTotal: (data) => {
 *     return Math.ceil((data?.totalCount || 0) / (data?.pageSize || 1));
 *   },
 * });
 * ```
 *
 * @remarks
 * - Automatically loads more when trigger element enters viewport
 * - Calculates total pages from `entriesCount` and `entriesPerPage` by default
 * - Requires a corresponding API route (use `createLoadMoreHandler`)
 * - Attach the returned `ref` to an element at the bottom of your list
 */
export function useInfiniteLoad<T extends PaginatedQueryResult>({
	query,
	initialData,
	additionalParams,
	calculatePagesTotal,
	apiEndpoint = "/api/load-more",
}: UseInfiniteLoadOptions<T>) {
	const {data, loadMore, pageNumber} = useInfiniteScroll<T>({
		query,
		initialData,
		apiEndpoint,
		additionalParams,
	});

	const pagesTotal = calculatePagesTotal
		? calculatePagesTotal(data)
		: Math.ceil(
				((data?.entriesCount as number) || 0) /
					((data?.entriesPerPage as number) || 1),
			);

	const hasNextPage = pageNumber < pagesTotal;

	const {inView, ref} = useInView();

	useEffect(() => {
		if (inView && hasNextPage) {
			loadMore();
		}
	}, [hasNextPage, inView, loadMore]);

	return {
		data: data as T,
		loadMore,
		pageNumber,
		hasNextPage,
		pagesTotal,
		ref,
		inView,
	};
}
