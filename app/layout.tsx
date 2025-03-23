'use client'

import './globals.css'
import { TrpcProvider } from './provider'
import { RecoilRoot } from 'recoil'
import { AuthProvider } from './auth/AuthProvider'

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
        <TrpcProvider>
          <RecoilRoot>
            <AuthProvider>
              {children}
            </AuthProvider>
          </RecoilRoot>
        </TrpcProvider>
      </body>
    </html>
  )
}