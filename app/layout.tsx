import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Resume Matchmaker - Matching IA pour Recrutement IT',
  description: 'Plateforme intelligente de matching entre profils candidats et appels d\'offres. Optimisez vos recrutements IT avec l\'IA Groq (Llama 3.3).',
  keywords: ['recrutement', 'IA', 'matching', 'CV', 'appel d\'offres', 'data', 'IT'],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        {children}
        <Toaster position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  )
}
