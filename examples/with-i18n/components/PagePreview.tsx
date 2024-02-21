'use client'

import { type QueryResponseInitial } from '@sanity/react-loader'

import { useQuery } from '@/data/sanity/useQuery'
import { PagePayload } from '@/types'

import { Page } from '@/components/Page'
import { PAGE_QUERY } from '@/data/sanity/queries'

type Props = {
  params: { pathname: string; locale: string }
  initial: QueryResponseInitial<PagePayload | null>
}

export default function PagePreview(props: Props) {
  const { params, initial } = props
  const { data } = useQuery<PagePayload | null>(PAGE_QUERY, params, {
    initial,
  })

  return <Page data={data!} />
}
