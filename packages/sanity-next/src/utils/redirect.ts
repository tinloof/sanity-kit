import {type NextRequest, NextResponse} from "next/server";
import {defineQuery} from "next-sanity";
import type {DefinedFetchType} from "./next-sanity-types";
import {getPathVariations} from "./urls";

/**
 * Shared redirect lookup options.
 */
export type RedirectOptions = {
	/** Try the exact query string before falling back to the path. Defaults to false. */
	matchQueryString?: boolean;
	/** Optional custom GROQ query accepting $paths and returning a redirect or null. */
	query?: string;
};

export type GetRedirectParams = RedirectOptions & {
	/** Source path, including the query string when matchQueryString is enabled. */
	source: string;
	/** Sanity fetch function from next-sanity */
	sanityFetch: DefinedFetchType;
};

/**
 * Redirect configuration returned from Sanity.
 */
export type RedirectData = {
	/** The source path that triggers the redirect */
	source: string;
	/** The destination URL to redirect to */
	destination: string;
	/** Whether this is a permanent or temporary redirect */
	permanent: boolean;
} | null;

/**
 * GROQ query to fetch redirect configuration from Sanity.
 */
const REDIRECT_QUERY = defineQuery(`
  *[_type == "settings"][0].redirects[@.source in $paths][0]
`);

/**
 * Fetches redirect configuration from Sanity for a given source path.
 *
 * This function automatically generates path variations to handle different
 * URL formats (with/without leading/trailing slashes) and queries Sanity
 * to find matching redirect rules.
 *
 * @param params - Configuration object
 * @param params.source - Source path, optionally including the query string
 * @param params.sanityFetch - Sanity fetch function from next-sanity
 * @param params.query - Optional custom GROQ query
 * @param params.matchQueryString - Try the exact query before path fallback
 *
 * @returns Promise that resolves to redirect data or null if no redirect found
 */
export async function getRedirect({
	source,
	sanityFetch,
	query = REDIRECT_QUERY,
	matchQueryString = false,
}: GetRedirectParams): Promise<RedirectData> {
	if (matchQueryString) {
		const queryIndex = source.indexOf("?");
		if (queryIndex !== -1) {
			const pathname = source.slice(0, queryIndex);
			const search = source.slice(queryIndex);
			// Vary only the pathname. Query order, encoding, and slashes are literal.
			if (search !== "?") {
				const {data} = (await sanityFetch({
					params: {
						paths: getPathVariations(pathname).map((path) => path + search),
					},
					query,
					perspective: "published",
					stega: false,
				})) as {data: RedirectData};
				if (data) return data;
			}
			source = pathname;
		}
	}
	const paths = getPathVariations(source);

	// next-sanity 13 resolves `data` through `ClientReturn<Query, unknown>`, which
	// falls back to `unknown` for queries absent from the consumer's generated
	// `SanityQueries`. This query is defined here, so its shape is known.
	const {data} = (await sanityFetch({
		params: {paths},
		query,
		perspective: "published",
		stega: false,
	})) as {data: RedirectData};

	return data;
}

export type RedirectIfNeededParams = RedirectOptions & {
	sanityFetch: DefinedFetchType;
	request: NextRequest;
};

export async function redirectIfNeeded({
	sanityFetch,
	request,
	query,
	matchQueryString = false,
}: RedirectIfNeededParams) {
	const redirect = await getRedirect({
		source:
			request.nextUrl.pathname +
			(matchQueryString ? request.nextUrl.search : ""),
		sanityFetch,
		query,
		matchQueryString,
	});

	if (redirect && redirect?.destination) {
		return NextResponse.redirect(new URL(redirect.destination, request.url), {
			status: redirect.permanent ? 301 : 302,
		});
	}
}
