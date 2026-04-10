import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthInitializer } from '@/components/auth-initializer'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ClubHub - Gestión de Clubes',
  description: 'Sistema de gestión de clubes estudiantiles, eventos y miembros',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/uvg.ong' },
      {
        url: '/uvg.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/uvg.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/uvg.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/uvg.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthInitializer />
        {children}
        <Toaster richColors />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
