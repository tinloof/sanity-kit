import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

const PagePreview = dynamic(() => import('@/components/PagePreview'))

export default async function IndexRoute({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const initial = await loadPage('/', locale)

  if (draftMode().isEnabled) {
    return <PagePreview initial={initial} params={{ pathname: '/', locale }} />
  }

  return <Page data={initial.data} />
}
