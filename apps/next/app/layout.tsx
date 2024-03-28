import 'tailwindcss/tailwind.css'

import { Inter } from 'next/font/google'

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
      <body>{children}</body>
    </html>
  )
}
