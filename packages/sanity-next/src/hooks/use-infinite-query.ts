"use client";
import type {ClientReturn, SanityClient} from "@sanity/client";
import {useCallback, useRef} from "react";
import type {SWRInfiniteConfiguration} from "swr/infinite";
import useSWRInfinite from "swr/infinite";

export type ParamsState<
	TQuery extends string,
	TParams extends Record<string, unknown>,
> = {
	/** Current page index (0-based) */
	pageIndex: number;
	/** Data from the previous page, or null for the first page */
	previousPageData: ClientReturn<TQuery, TParams> | null;
};

/**
 * Configuration for pagination params generation
 */
export type PaginationConfig = {
	/** Number of entries to show per page */
	pageSize: number;
};

/**
 * Generated pagination params ready to spread into your query params
 */
export type PaginationParams = {
	/** Start index for GROQ slice (0-based) */
	pageStart: number;
	/** End index for GROQ slice (exclusive) */
	pageEnd: number;
	/** Current page number (1-based, for display purposes) */
	pageNumber: number;
	/** Number of entries per page (for round-tripping in query results) */
	entriesPerPage: number;
};

/**
 * Helpers available in the params function
 */
export type ParamsHelpers = {
	/**
	 * Generates pagination params for GROQ slice queries.
	 *
	 * Use this to generate `pageStart`, `pageEnd`, `pageNumber`, and `entriesPerPage`
	 * params that work with GROQ's slice syntax `[$pageStart...$pageEnd]`.
	 *
	 * @param config - Configuration with `pageSize`
	 * @returns Object with `pageStart`, `pageEnd`, `pageNumber`, and `entriesPerPage`
	 *
	 * @example
	 * ```ts
	 * params: ({ pageIndex }, { paginationParams }) => ({
	 *   ...paginationParams({ pageSize: 10 }),
	 *   filterTag: tagParam ?? null,
	 * })
	 * ```
	 */
	paginationParams: (config: PaginationConfig) => PaginationParams;
};

/**
 * Configuration for merging pages
 */
export type MergePagesConfig<TData> = {
	/** Key in each page that contains the entries array to merge (default: "entries") */
	entriesKey?: keyof TData;
};

/**
 * Configuration for hasMore check
 */
export type HasMoreConfig<TData> = {
	/** Key in each page that contains the entries array (default: "entries") */
	entriesKey?: keyof TData;
	/** Key in each page that contains the total count (default: "entriesCount") */
	countKey?: keyof TData;
};

/**
 * Helpers available in the select function
 */
export type SelectHelpers<TData> = {
	/**
	 * Merges multiple pages into a single result by concatenating entries arrays.
	 *
	 * This handles the common pattern of combining paginated results where each page
	 * has an `entries` array (or similar) that should be merged, while keeping
	 * other fields from the last page (like `entriesCount`, metadata, etc.).
	 *
	 * @param pages - Array of all fetched pages
	 * @param config - Optional configuration (default entriesKey is "entries")
	 * @returns Merged data with all entries combined, or null if no valid pages
	 *
	 * @example
	 * ```ts
	 * // Default usage with "entries" key
	 * select: (pages, { mergePages }) => mergePages(pages)
	 *
	 * // Custom entries key
	 * select: (pages, { mergePages }) => mergePages(pages, { entriesKey: "posts" })
	 * ```
	 */
	mergePages: (
		pages: TData[],
		config?: MergePagesConfig<TData>,
	) => TData | null;
};

/**
 * Callback to determine if there are more pages to load.
 * Receives the array of all fetched pages and should return a boolean.
 */
export type HasMoreCallback<TData> = (pages: TData[]) => boolean;

export type UseSanityInfiniteQueryOptionsBase<
	TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
> = {
	/** The Sanity client instance to use for fetching */
	client: SanityClient;
	/** The GROQ query to execute (use a string literal for type inference) */
	query: TQuery;
	/**
	 * Function to get params for each page.
	 * Return `null` to stop fetching more pages.
	 *
	 * @param state - Contains `pageIndex` and `previousPageData`
	 * @param helpers - Contains `paginationParams` helper for generating pagination params
	 * @returns Query params object, or `null` to stop pagination
	 */
	params: (
		state: ParamsState<TQuery, TParams>,
		helpers: ParamsHelpers,
	) => (TParams & Record<string, unknown>) | null;
	/**
	 * Function to transform/merge pages into the final data shape.
	 *
	 * @param pages - Array of all fetched pages
	 * @param helpers - Contains `mergePages` helper for combining paginated results
	 * @returns Transformed/merged data
	 */
	select: (
		pages: ClientReturn<TQuery, TParams>[],
		helpers: SelectHelpers<ClientReturn<TQuery, TParams>>,
	) => TSelected;
	/** SWR infinite configuration options */
	swrOptions?: SWRInfiniteConfiguration;
	/**
	 * Callback to determine if there are more pages to load.
	 * Receives the array of all fetched pages.
	 *
	 * @example
	 * ```ts
	 * // Default usage with "entries" and "entriesCount"
	 * hasMore: (pages) => {
	 *   const allEntries = pages.flatMap(p => p?.entries ?? []);
	 *   const lastPage = pages[pages.length - 1];
	 *   return allEntries.length < (lastPage?.entriesCount ?? 0);
	 * }
	 * ```
	 */
	hasMore?: HasMoreCallback<ClientReturn<TQuery, TParams>>;
};

export type UseSanityInfiniteQueryOptionsWithInitialData<
	TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
> = UseSanityInfiniteQueryOptionsBase<TQuery, TParams, TSelected> & {
	/** Initial data for SSR hydration (first page). When provided, no fetch occurs on mount. */
	initialData: ClientReturn<TQuery, TParams>;
};

export type UseSanityInfiniteQueryOptionsWithoutInitialData<
	TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
> = UseSanityInfiniteQueryOptionsBase<TQuery, TParams, TSelected> & {
	/** Initial data for SSR hydration (first page). When omitted, first page is fetched on mount. */
	initialData?: undefined;
};

export type UseSanityInfiniteQueryOptions<
	TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
> =
	| UseSanityInfiniteQueryOptionsWithInitialData<TQuery, TParams, TSelected>
	| UseSanityInfiniteQueryOptionsWithoutInitialData<TQuery, TParams, TSelected>;

/**
 * Default hasMore implementation using "entries" and "entriesCount" fields.
 */
function defaultHasMore<TData>(pages: TData[]): boolean {
	return createHasMore(pages);
}

/**
 * Generates pagination params for a given page index and page size.
 */
function createPaginationParams(
	pageIndex: number,
	config: PaginationConfig,
): PaginationParams {
	const {pageSize} = config;
	return {
		pageStart: pageIndex * pageSize,
		pageEnd: pageIndex * pageSize + pageSize,
		pageNumber: pageIndex + 1,
		entriesPerPage: pageSize,
	};
}

/**
 * Generates pagination params for draft mode (fetches all by default).
 */
function createDraftPaginationParams(
	config?: PaginationConfig,
): PaginationParams {
	const pageSize = config?.pageSize ?? 10000;
	return {
		pageStart: 0,
		pageEnd: pageSize,
		pageNumber: 1,
		entriesPerPage: pageSize,
	};
}

/**
 * Merges multiple pages into a single result by concatenating entries arrays.
 */
function createMergePages<TData>(
	pages: TData[],
	config?: MergePagesConfig<TData>,
): TData | null {
	const entriesKey = (config?.entriesKey ?? "entries") as keyof TData;

	const validPages = pages.filter(
		(page): page is NonNullable<TData> => page != null,
	);

	if (validPages.length === 0) {
		return null;
	}

	const entries = validPages.flatMap((page) => {
		const pageEntries = page[entriesKey];
		return Array.isArray(pageEntries) ? pageEntries : [];
	});

	const lastPage = validPages[validPages.length - 1];

	return {
		...lastPage,
		[entriesKey]: entries,
	} as TData;
}

/**
 * Checks if there are more entries to load based on current entries vs total count.
 */
function createHasMore<TData>(
	pages: TData[],
	config?: HasMoreConfig<TData>,
): boolean {
	const entriesKey = (config?.entriesKey ?? "entries") as keyof TData;
	const countKey = (config?.countKey ?? "entriesCount") as keyof TData;

	const validPages = pages.filter(
		(page): page is NonNullable<TData> => page != null,
	);

	if (validPages.length === 0) {
		return false;
	}

	const totalEntries = validPages.reduce((acc, page) => {
		const pageEntries = page[entriesKey];
		return acc + (Array.isArray(pageEntries) ? pageEntries.length : 0);
	}, 0);

	const lastPage = validPages[validPages.length - 1];
	const totalCount = lastPage[countKey];

	if (typeof totalCount !== "number") {
		return false;
	}

	return totalEntries < totalCount;
}

/**
 * A hook for infinite loading of Sanity data using useSWRInfinite.
 * Types are automatically inferred from the query when using Sanity's typegen.
 *
 * @example Basic usage with pagination helpers
 * ```tsx
 * const { data, loadMore } = useInfiniteQuery({
 *   client: sanityClient,
 *   query: BLOG_INDEX_QUERY,
 *   initialData,
 *   params: ({ pageIndex, previousPageData }, { paginationParams }) => {
 *     const pageSize = 10;
 *     // Stop if previous page had fewer entries than pageSize
 *     if (previousPageData?.entries && previousPageData.entries.length < pageSize) {
 *       return null;
 *     }
 *     return {
 *       ...paginationParams({ pageSize }),
 *       filterTag: tagParam ?? null,
 *     };
 *   },
 *   select: (pages, { mergePages }) => mergePages(pages),
 * });
 * ```
 *
 * @example Manual pagination (without helpers)
 * ```tsx
 * const { data, loadMore } = useInfiniteQuery({
 *   client: sanityClient,
 *   query: groq`*[_type == "blog.index"][0] {
 *     "entries": *[_type == "blog.post"] | order(publishedAt desc) [$pageStart...$pageEnd] { _id, title },
 *     "entriesCount": count(*[_type == "blog.post"])
 *   }`,
 *   params: ({ pageIndex, previousPageData }) => {
 *     const pageSize = 10;
 *     if (previousPageData?.entries && previousPageData.entries.length < pageSize) {
 *       return null;
 *     }
 *     return {
 *       pageStart: pageIndex * pageSize,
 *       pageEnd: pageIndex * pageSize + pageSize,
 *     };
 *   },
 *   select: (pages) => {
 *     const validPages = pages.filter(Boolean);
 *     if (validPages.length === 0) return null;
 *     const entries = validPages.flatMap((page) => page.entries ?? []);
 *     const lastPage = validPages[validPages.length - 1];
 *     return { ...lastPage, entries };
 *   },
 * });
 * ```
 *
 * @example With hasMore callback
 * ```tsx
 * const { data, loadMore, hasMore } = useInfiniteQuery({
 *   client: sanityClient,
 *   query: POSTS_QUERY,
 *   params: ({ pageIndex }, { paginationParams }) => ({
 *     ...paginationParams({ pageSize: 12 }),
 *   }),
 *   select: (pages, { mergePages }) => mergePages(pages, { entriesKey: "posts" }),
 *   hasMore: (pages) => {
 *     const allPosts = pages.flatMap(p => p?.posts ?? []);
 *     const lastPage = pages[pages.length - 1];
 *     return allPosts.length < (lastPage?.totalPosts ?? 0);
 *   },
 * });
 * ```
 */
export function useInfiniteQuery<
	const TQuery extends string,
	TParams extends Record<string, unknown> = Record<string, unknown>,
	TSelected = ClientReturn<TQuery, TParams>,
>({
	client,
	query,
	params,
	select,
	initialData,
	swrOptions,
	hasMore: hasMoreCallback,
}: UseSanityInfiniteQueryOptions<TQuery, TParams, TSelected>) {
	type TData = ClientReturn<TQuery, TParams>;

	// Use refs to maintain stable references and avoid recreating getKey/fetcher
	const paramsRef = useRef(params);
	paramsRef.current = params;

	const selectRef = useRef(select);
	selectRef.current = select;

	const clientRef = useRef(client);
	clientRef.current = client;

	// Production mode: use useSWRInfinite for pagination
	const getKey = useCallback(
		(pageIndex: number, previousPageData: TData | null) => {
			// Create params helpers with current pageIndex
			const paramsHelpers: ParamsHelpers = {
				paginationParams: (config: PaginationConfig) =>
					createPaginationParams(pageIndex, config),
			};

			const resolvedParams = paramsRef.current(
				{pageIndex, previousPageData},
				paramsHelpers,
			);

			// Returning null signals to SWR that there are no more pages
			if (resolvedParams === null) {
				return null;
			}

			return [query, resolvedParams] as const;
		},
		[query],
	);

	const fetcher = useCallback(
		async ([query, params]: readonly [TQuery, TParams]): Promise<TData> => {
			const result = await clientRef.current.fetch(
				query,
				params as Record<string, unknown>,
			);
			return result;
		},
		[],
	);

	// If initialData is provided, use it as fallback data for the first page
	// This prevents fetching on mount - only fetch when loadMore is called
	const fallbackData = initialData ? [initialData] : undefined;

	const {
		data: swrPages,
		isLoading: swrIsLoading,
		isValidating: swrIsValidating,
		size: swrSize,
		setSize: swrSetSize,
		mutate: swrMutate,
		error: swrError,
	} = useSWRInfinite(getKey, fetcher, {
		revalidateFirstPage: false,
		revalidateOnFocus: false,
		revalidateIfStale: false,
		fallbackData,
		...swrOptions,
	});

	// Create select helpers
	const selectHelpers: SelectHelpers<TData> = {
		mergePages: (pagesArg, config) => createMergePages(pagesArg, config),
	};

	const data = swrPages
		? selectRef.current(swrPages, selectHelpers)
		: undefined;

	// Calculate hasMore using the callback or default implementation
	const hasMore = swrPages
		? (hasMoreCallback ?? defaultHasMore)(swrPages)
		: false;

	const loadMore = () => {
		if (!swrIsValidating) {
			swrSetSize((prevSize) => prevSize + 1);
		}
	};

	return {
		data,
		pages: swrPages,
		isLoading: swrIsLoading,
		isValidating: swrIsValidating,
		size: swrSize,
		setSize: swrSetSize,
		loadMore,
		/** Whether there are more entries to load */
		hasMore,
		mutate: swrMutate,
		error: swrError,
	};
}
