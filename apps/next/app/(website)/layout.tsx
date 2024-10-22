import { Metadata } from 'next'
import { VisualEditing } from 'next-sanity'
import { revalidatePath, revalidateTag } from 'next/cache'
import { draftMode } from 'next/headers'

import config from '@/config'

export const metadata: Metadata = {
  title: `${config.siteName} - Website`,
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  const isDraftModeEnabled = (await draftMode()).isEnabled
  return (
    <>
      {children}
      {isDraftModeEnabled && (
        <VisualEditing
          refresh={async (payload) => {
            'use server'
            if (!isDraftModeEnabled) {
              console.debug(
                'Skipped manual refresh because draft mode is not enabled',
              )
              return
            }
            if (payload.source === 'mutation') {
              if (payload.document.slug?.current) {
                const tag = `${payload.document._type}:${payload.document.slug.current}`
                console.log('Revalidate slug', tag)
                await revalidateTag(tag)
              }
              console.log('Revalidate tag', payload.document._type)
              return revalidateTag(payload.document._type)
            }
            await revalidatePath('/', 'layout')
          }}
        />
      )}
    </>
  )
}
