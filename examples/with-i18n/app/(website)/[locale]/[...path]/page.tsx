import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'

export default async function DynamicRoute({
  params: { path, locale },
}: {
  params: { path: string[]; locale: string }
}) {
  const pathname = `/${path.join('/')}`
  const data = await loadPage(pathname, locale)

  return <Page data={data} />
}
