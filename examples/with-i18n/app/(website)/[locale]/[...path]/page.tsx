import { Page } from '@/components/Page'
import { loadPage } from '@/data/sanity'

export default async function DynamicRoute({
  params,
}: {
  params: Promise<{ path: string[]; locale: string }>
}) {
  const { path, locale } = await params
  const pathname = `/${path.join('/')}`
  const data = await loadPage(pathname, locale)

  return <Page data={data} />
}
