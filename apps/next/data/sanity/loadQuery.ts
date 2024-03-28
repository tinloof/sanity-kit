import type { QueryParams } from 'next-sanity'
import type { UnfilteredResponseQueryOptions } from '@sanity/client'

import { draftMode } from 'next/headers'
import 'server-only'

import { client } from '@/data/sanity/client'
import config from '@/config'

const DEFAULT_PARAMS = {} as QueryParams

export async function loadQuery<QueryResponse>({
  query,
  params = DEFAULT_PARAMS,
}: {
  query: string
  params?: QueryParams
}): Promise<QueryResponse> {
  const isDraftMode = draftMode().isEnabled
  const token = config.sanity.token

  if (isDraftMode && !token) {
    throw new Error(
      'The `SANITY_API_READ_TOKEN` environment variable is required in Draft Mode.',
    )
  }

  // https://nextjs.org/docs/app/api-reference/functions/fetch#optionsnextrevalidate
  /*
  const REVALIDATE_SKIP_CACHE = 0
  const REVALIDATE_CACHE_FOREVER = false
  const revalidate = (
    isDraftMode
      ? // If we're in Draft Mode we want fresh content on every request so we skip the cache
        REVALIDATE_SKIP_CACHE
      : revalidateSecret
        ? // If GROQ webhook revalidation is setup, then we only want to revalidate on-demand so the cache lives as long as possible
          REVALIDATE_CACHE_FOREVER
        : // No webhook means we don't know ahead of time when content changes, so we use the Sanity CDN API cache which has its own Stale-While-Revalidate logic
          REVALIDATE_SKIP_CACHE
          ) satisfies NextFetchRequestConfig['revalidate']
          // */

  const perspective = isDraftMode ? 'previewDrafts' : 'published'

  const options = {
    filterResponse: false,
    useCdn: false,
    resultSourceMap: isDraftMode ? 'withKeyArraySelector' : false,
    token: isDraftMode ? token : undefined,
    perspective,
    next: {
      tags: ['sanity'],
      // Cache forever in Draft Mode until expired with revalidateTag, use time-based cache in production that matches the CDN cache
      revalidate: isDraftMode ? false : 60,
    },
  } satisfies UnfilteredResponseQueryOptions
  const result = await client.fetch<QueryResponse>(query, params, {
    ...options,
    stega: isDraftMode,
  } as UnfilteredResponseQueryOptions)
  return result.result
}
