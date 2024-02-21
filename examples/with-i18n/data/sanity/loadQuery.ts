import * as queryStore from '@sanity/react-loader'
import { draftMode } from 'next/headers'

import { client } from '@/data/sanity/client'

import config from '@/config'

let serverClientSet = false

function initClient() {
  const serverClient = client.withConfig({
    token: config.sanity.token,
    stega: {
      enabled: draftMode().isEnabled,
    },
  })

  if (!serverClientSet) {
    queryStore.setServerClient(serverClient)
    serverClientSet = true
  }

  const usingCdn = serverClient.config().useCdn

  return {
    queryStore,
    usingCdn,
  }
}

// Automatically handle draft mode
export function loadQuery<T>(query, params = {}) {
  const { queryStore, usingCdn } = initClient()
  return queryStore.loadQuery<T>(query, params, {
    perspective: draftMode().isEnabled ? 'previewDrafts' : 'published',
    next: {
      revalidate: draftMode().isEnabled || !usingCdn ? 0 : 120,
    },
  })
}
