import {useEffect} from "react";
import {
	useInfiniteScroll,
	type PaginatedQueryResult,
} from "./use-infinite-scroll";
import {useInView} from "./use-in-view";

export type {PaginatedQueryResult};

type UseInfiniteLoadOptions<T extends PaginatedQueryResult> = {
	query: string;
	initialData: T;
	additionalParams?: Record<string, any>;
	calculatePagesTotal?: (data: T) => number;
	apiEndpoint?: string;
};

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
