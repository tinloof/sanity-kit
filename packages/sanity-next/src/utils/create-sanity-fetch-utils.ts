import {draftMode} from "next/headers";
import type {DefinedSanityFetchType} from "next-sanity/live";

type QueryString = string;

type SanityFetchOptions<T extends QueryString> = {
  query: T;
  params?: Record<string, unknown>;
  stega?: boolean;
};

type CreateSanityFetchUtilsOptions = {
  sanityFetch: DefinedSanityFetchType;
};

type SanityFetchUtils = {
  /**
   * Fetch data in server components with automatic perspective and stega based on preview mode
   */
  sanityFetch: <const T extends QueryString>(
    options: Pick<SanityFetchOptions<T>, "query" | "params" | "stega">,
  ) => ReturnType<DefinedSanityFetchType>;

  /**
   * Fetch data for metadata generation without stega
   */
  sanityFetchMetadata: <const T extends QueryString>(
    options: Pick<SanityFetchOptions<T>, "query" | "params">,
  ) => ReturnType<DefinedSanityFetchType>;

  /**
   * Fetch published content for static params generation without stega
   */
  sanityFetchStaticParams: <const T extends QueryString>(
    options: Pick<SanityFetchOptions<T>, "query" | "params">,
  ) => ReturnType<DefinedSanityFetchType>;
};

async function isPreviewMode(): Promise<boolean> {
  const {isEnabled} = await draftMode();
  return isEnabled;
}

/**
 * Creates multiple sanity fetch functions for different use cases
 */
export function createSanityFetchUtils({
  sanityFetch: baseSanityFetch,
}: CreateSanityFetchUtilsOptions): SanityFetchUtils {
  return {
    sanityFetch: async ({query, params, stega}) => {
      const isPreviewModeEnabled = await isPreviewMode();
      const perspective = isPreviewModeEnabled ? "drafts" : "published";
      return baseSanityFetch({
        query,
        params,
        perspective,
        stega: stega ?? isPreviewModeEnabled,
      });
    },

    sanityFetchMetadata: async ({query, params}) => {
      const perspective = (await isPreviewMode()) ? "drafts" : "published";
      return baseSanityFetch({
        query,
        params,
        perspective,
        stega: false,
      });
    },

    sanityFetchStaticParams: async ({query, params}) => {
      return baseSanityFetch({
        query,
        params,
        perspective: "published",
        stega: false,
      });
    },
  };
}
