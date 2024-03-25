import config from '@/config'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { draftMode } from 'next/headers'

const LiveVisualEditing = dynamic(
  () => import('@/components/LiveVisualEditing'),
)

export const metadata: Metadata = {
  title: `${config.siteName} - Website`,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      {draftMode().isEnabled && <LiveVisualEditing />}
    </>
  )
}
