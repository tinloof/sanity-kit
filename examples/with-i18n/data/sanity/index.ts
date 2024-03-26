import { PagePayload } from '@/types'
import { loadQuery } from './loadQuery'
import { PAGE_QUERY } from './queries'

export async function loadPage(pathname: string, locale: string) {
  return loadQuery<PagePayload | null>({
    query: PAGE_QUERY,
    params: { pathname, locale },
    tags: ['page'],
  })
}
