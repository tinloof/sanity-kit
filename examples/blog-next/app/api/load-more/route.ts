import {sanityFetch} from "@/data/sanity/client";

export const maxDuration = 60;

export async function POST(req: Request) {
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

		return new Response(JSON.stringify({error: errorMessage, success: false}), {
			headers: {"Content-Type": "application/json"},
			status: 500,
		});
	}
}
