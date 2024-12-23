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
      <body>
        <RecoilRoot>
          <AuthProvider>
            <TrpcProvider>{children}</TrpcProvider>
          </AuthProvider>
        </RecoilRoot>
      </body>
    </html>
  )
}