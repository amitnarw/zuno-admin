import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Zuno Admin , Streaming Operations',
  description: 'Control center for Zuno streaming platform, TV device pairing, and subscriptions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} bg-[#080808] text-[#f4f4f5] antialiased min-h-screen selection:bg-[#f08327]/30 selection:text-white`}>
        {children}
      </body>
    </html>
  )
}
