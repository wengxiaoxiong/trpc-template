'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { Spin } from 'antd'

interface AdminRouteGuardProps {
  children: React.ReactNode
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const router = useRouter()
  const { data: user, isLoading } = trpc.user.getCurrentUser.useQuery()

  useEffect(() => {
    if (!isLoading && (!user || !user.isAdmin)) {
      router.push('/')
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!user?.isAdmin) {
    return null
  }

  return <>{children}</>
} 