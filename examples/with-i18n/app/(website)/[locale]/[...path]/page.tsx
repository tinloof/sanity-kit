import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'

const PagePreview = dynamic(() => import('@/components/PagePreview'))

export default async function DynamicRoute({
  params: { path, locale },
}: {
  params: { path: string[]; locale: string }
}) {
  const pathname = `/${path.join('/')}`
  const initial = await loadPage(pathname, locale)

  if (draftMode().isEnabled) {
    return <PagePreview initial={initial} params={{ pathname, locale }} />
  }

  return <Page data={initial.data} />
}
