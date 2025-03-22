// AuthProvider.tsx

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from '@prisma/client'
import { trpc } from '@/utils/trpc/client'

interface AuthContextType {
  login: (token: string) => void
  logout: () => void
  user: User | undefined
}

const AuthContext = createContext<AuthContextType>({
  login: () => {},
  logout: () => {},
  user: undefined,
})

// 新增 token 工具函数
const TOKEN_KEY = 'token'

const tokenUtils = {
  set: (token: string) => {
    localStorage.setItem(TOKEN_KEY, token)
    document.cookie = `${TOKEN_KEY}=${token}; path=/`
  },
  remove: () => {
    localStorage.removeItem(TOKEN_KEY)
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  },
  get: () => localStorage.getItem(TOKEN_KEY)
}

// 简化 AuthProvider 组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()

  const { data: currentUser, error } = trpc.auth.getCurrentUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true
  })

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser as unknown as User)
    }
  }, [currentUser])

  useEffect(() => {
    const isAuthRoute = ['/login', '/register'].includes(pathname)
    if (error && !isAuthRoute) {
      tokenUtils.remove()
      router.push('/login')
    }
  }, [error, pathname, router])

  const utils = trpc.useUtils()
  
  const login = useCallback((token: string) => {
    tokenUtils.set(token)
    // 立即获取用户信息
    utils.auth.getCurrentUser.invalidate()
    router.push('/')
  }, [router, utils])

  const logout = useCallback(() => {
    setUser(undefined)
    tokenUtils.remove()
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 简化 useAuth hook，移除 Recoil
export function useAuth() {
  return useContext(AuthContext)
}