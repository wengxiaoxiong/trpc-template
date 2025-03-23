'use client'

import { ReactNode } from 'react'
import { AuthFooter } from './AuthFooter'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {children}
        </div>
        <AuthFooter />
      </div>
    </div>
  )
} 