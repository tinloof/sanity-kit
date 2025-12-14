import {useCallback, useState} from "react";

export type PaginatedQueryResult = {
	entries?: Array<any>;
	[key: string]: any;
} | null;

type UseInfiniteScrollProps<T> = {
	query: string;
	initialData: T;
	apiEndpoint?: string;
	additionalParams?: Record<string, any>;
};

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
