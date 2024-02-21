import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'

const PagePreview = dynamic(() => import('@/components/PagePreview'))
// const LiveVisualEditing = dynamic(
//   () => import('@/components/LiveVisualEditing'),
// )

export default async function DynamicRoute({
  params,
}: {
  params: { path: string[] }
}) {
  const pathname = `/${params.path.join('/')}`
  const initial = await loadPage(pathname)

  if (draftMode().isEnabled) {
    return (
      <>
        <PagePreview initial={initial} params={{ pathname }} />
        {/* <LiveVisualEditing /> */}
      </>
    )
  }

  return <Page data={initial.data} />
}
