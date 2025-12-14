import {useCallback, useState} from "react";

/**
 * Type for paginated query results
 *
 * Your Sanity query should return an object matching this structure.
 * The `entries` array will be accumulated across page loads.
 */
export type PaginatedQueryResult = {
	/** Array of entries/items to display */
	entries?: Array<any>;
	/** Additional fields from your query */
	[key: string]: any;
} | null;

/**
 * Props for the useInfiniteScroll hook
 */
type UseInfiniteScrollProps<T> = {
	/** The GROQ query to execute */
	query: string;
	/** Initial data loaded on the server */
	initialData: T;
	/** API endpoint for loading more data (default: "/api/load-more") */
	apiEndpoint?: string;
	/** Additional parameters to pass to the query */
	additionalParams?: Record<string, any>;
};

/**
 * Core pagination logic hook for infinite scrolling
 *
 * Handles paginated data fetching and state management without intersection observer.
 * Use this when you want manual control over when to load more data (e.g., with a "Load More" button).
 * For automatic infinite scroll with intersection observer, use `useInfiniteLoad` instead.
 *
 * @param props - Configuration options
 * @returns Object containing current data, loadMore function, and pageNumber
 *
 * @example
 * ```tsx
 * "use client";
 * import { useInfiniteScroll } from "@tinloof/sanity-next/hooks";
 * import { BLOG_INDEX_QUERY } from "@/sanity/queries";
 *
 * export function BlogIndex({ initialData }) {
 *   const { data, loadMore, pageNumber } = useInfiniteScroll({
 *     query: BLOG_INDEX_QUERY,
 *     initialData,
 *     additionalParams: {
 *       entriesPerPage: 12,
 *     },
 *   });
 *
 *   return (
 *     <div>
 *       {data?.entries?.map((post) => (
 *         <article key={post._id}>{post.title}</article>
 *       ))}
 *       <button onClick={loadMore}>
 *         Load More (Page {pageNumber})
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @remarks
 * - Automatically calculates pageStart, pageEnd, and pageNumber
 * - Accumulates entries across page loads
 * - Merges new data with existing data
 * - Requires a corresponding API route (use `createLoadMoreHandler`)
 */
export function useInfiniteScroll<T extends PaginatedQueryResult>({
	query,
	initialData,
	apiEndpoint = "/api/load-more",
	additionalParams,
}: UseInfiniteScrollProps<T>) {
	const [{data, pageNumber}, setState] = useState({
		data: initialData,
		pageNumber: 1,
	});

	const loadMore = useCallback(async () => {
		try {
			const response = await fetch(apiEndpoint, {
				body: JSON.stringify({
					params: {
						...getParams({
							entriesPerPage: additionalParams?.entriesPerPage ?? 12,
							pageNumber: pageNumber + 1,
						}),
						...additionalParams,
					},
					query,
				}),
				headers: {
					"Content-Type": "application/json",
				},
				method: "POST",
			});

			const {data: newData} = await response.json();

			setState((prevState) => {
				const entries = [
					...(prevState.data?.entries || []),
					...(newData?.entries || []),
				];

				return {
					data: {
						...newData,
						entries,
					} as T,
					pageNumber: pageNumber + 1,
				};
			});
		} catch (error) {
			console.error(error);
		}
	}, [pageNumber, query, apiEndpoint, additionalParams]);

	return {data, loadMore, pageNumber};
}

const getParams = ({
	entriesPerPage,
	pageNumber = 1,
}: {
	entriesPerPage: number;
	pageNumber?: number;
}) => {
	const pageStart = entriesPerPage * (pageNumber - 1);
	const pageEnd = entriesPerPage * pageNumber;

	return {
		entriesPerPage,
		pageEnd,
		pageNumber,
		pageStart,
	};
};
