'use client'

import './globals.css'
import { AuthProvider } from './auth/AuthProvider'
import { I18nProvider } from './i18n-provider'
import { SessionProvider } from 'next-auth/react'
import { Inter } from 'next/font/google'
import Provider from './provider'

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <Provider>
            <I18nProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </I18nProvider>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  )
}