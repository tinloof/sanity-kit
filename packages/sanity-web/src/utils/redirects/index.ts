import {DefinedSanityFetchType} from "next-sanity";
import {REDIRECT_QUERY} from "../../queries";
import {getPathVariations} from "../urls";

/**
 * Parameters for the getRedirect function.
 */
export type GetRedirectParams = {
  /** The source path to look up redirects for (e.g., "/old-page") */
  source: string;
  /** Sanity fetch function from next-sanity */
  sanityFetch: DefinedSanityFetchType;
  /** Optional custom GROQ query (defaults to REDIRECT_QUERY) */
  query?: string;
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
 * Fetches redirect configuration from Sanity for a given source path.
 *
 * This function automatically generates path variations to handle different
 * URL formats (with/without leading/trailing slashes) and queries Sanity
 * to find matching redirect rules.
 *
 * @param params - Configuration object
 * @param params.source - The source path to look up (e.g., "/old-page")
 * @param params.sanityFetch - Sanity fetch function from next-sanity
 * @param params.query - Optional custom GROQ query
 *
 * @returns Promise that resolves to redirect data or null if no redirect found
 */
export async function getRedirect({
  source,
  sanityFetch,
  query = REDIRECT_QUERY,
}: GetRedirectParams): Promise<RedirectData> {
  const paths = getPathVariations(source);

  const {data} = await sanityFetch({
    params: {paths},
    query,
    perspective: "published",
    stega: false,
  });

  return data;
}
