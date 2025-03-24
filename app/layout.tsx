'use client'

import './globals.css'
import Provider from './provider'
import { RecoilRoot } from 'recoil'
import { I18nProvider } from './i18n-provider'

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
      <body>
        <I18nProvider>
          <Provider>
            <RecoilRoot>
              {children}
            </RecoilRoot>
          </Provider>
        </I18nProvider>
      </body>
    </html>
  )
}