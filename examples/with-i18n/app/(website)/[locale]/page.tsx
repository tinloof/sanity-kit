import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'

export default async function IndexRoute({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const data = await loadPage('/', locale)

  return <Page data={data} />
}
