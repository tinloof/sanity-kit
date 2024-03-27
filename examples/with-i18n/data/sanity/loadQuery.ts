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

  const perspective = isDraftMode ? 'previewDrafts' : 'published'

  const options = {
    filterResponse: false,
    useCdn: false,
    resultSourceMap: isDraftMode ? 'withKeyArraySelector' : false,
    token: isDraftMode ? token : undefined,
    perspective,
    next: {
      tags: ['sanity'],
      revalidate: isDraftMode ? 0 : undefined,
    },
  } satisfies UnfilteredResponseQueryOptions
  const result = await client.fetch<QueryResponse>(query, params, {
    ...options,
    stega: isDraftMode,
  } as UnfilteredResponseQueryOptions)
  return result.result
}
