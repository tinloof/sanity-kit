import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

const PagePreview = dynamic(() => import('@/components/PagePreview'))

export default async function IndexRoute() {
  const initial = await loadPage('/')

  if (draftMode().isEnabled) {
    return <PagePreview initial={initial} params={{ pathname: '/' }} />
  }

  return <Page data={initial.data} />
}
