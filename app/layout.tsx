import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { OrdersProvider } from '@/contexts/OrdersContext'
import { ClientsProvider } from '@/contexts/ClientsContext'

export const metadata: Metadata = {
  title: 'rein.atelier',
  description: 'Custom order management for rein.atelier',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Instrument+Serif:ital@0;1&family=Syne:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <SettingsProvider>
          <OrdersProvider>
            <ClientsProvider>
              {children}
              <Toaster richColors position="bottom-right" />
            </ClientsProvider>
          </OrdersProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
