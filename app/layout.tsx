import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TFS Energy — Lighting Audit',
  description: 'Professional lighting audit and LED savings calculator',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-slate-100">
        {children}
      </body>
    </html>
  )
}
