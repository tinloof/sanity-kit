import 'tailwindcss/tailwind.css'

import config from '@/config'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'
import { Inter } from 'next/font/google'
import { draftMode } from 'next/headers'

const LiveVisualEditing = dynamic(
  () => import('@/components/LiveVisualEditing'),
)

export const metadata: Metadata = {
  title: `${config.siteName} - Website`,
}

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export default async function RootLayout({
  params: { locale },
  children,
}: {
  params: { locale: string }
  children: React.ReactNode
}) {
  return (
    <html lang={locale} className={sans.variable}>
      <body>
        {children}
        {draftMode().isEnabled && <LiveVisualEditing />}
      </body>
    </html>
  )
}
