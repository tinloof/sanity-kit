import {DefinedSanityFetchType} from "next-sanity/live";
import {NextRequest} from "next/server";

export function createLoadMoreHandler(sanityFetch: DefinedSanityFetchType) {
	return async function POST(req: NextRequest) {
		try {
			const {params, query} = await req.json();

			const {data: result} = await sanityFetch({
				params,
				query,
			});

			// Check if the fetch request was successful
			if (!result) {
				throw new Error(`Fetch error`);
			}

			return new Response(JSON.stringify({data: result, success: true}), {
				headers: {"Content-Type": "application/json"},
				status: 200,
			});
		} catch (error) {
			let errorMessage = "An unknown error occurred";
			if (error instanceof Error) {
				errorMessage = error.message;
			}

			console.error(error);

			return new Response(
				JSON.stringify({error: errorMessage, success: false}),
				{
					headers: {"Content-Type": "application/json"},
					status: 500,
				},
			);
		}
	};
}
