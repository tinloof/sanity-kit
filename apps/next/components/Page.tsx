import type { PagePayload } from '@/types'
import { SanityImage } from './SanityImage'

export interface PageProps {
  data: PagePayload | null
}

export function Page({ data }: PageProps) {
  const { title } = data ?? {}

  return (
    <div className="w-screen h-screen flex flex-col justify-center items-center">
      <h1>{title}</h1>
      <div className="w-[500px] mt-10">
        {data?.image && (
          <SanityImage aspectRatio="1/1" sizes="500px" data={data.image} />
        )}
      </div>
    </div>
  )
}
