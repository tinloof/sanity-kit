import 'tailwindcss/tailwind.css'

import { ExitPreview } from '@tinloof/sanity-web'

import { Inter } from 'next/font/google'

import { disableDraftMode } from '@/app/actions'

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin'],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={sans.variable}>
      <body>
        {children}
        <ExitPreview disableDraftMode={disableDraftMode} />
      </body>
    </html>
  )
}
