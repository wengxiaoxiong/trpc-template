// AuthProvider.tsx

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'

interface User {
  id: number
  username: string
  email?: string | null
  avatar: string | null
  isAdmin: boolean
  storageUsed: number
}

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
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token)
    }
    document.cookie = `${TOKEN_KEY}=${token}; path=/`
  },
  remove: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY)
    }
    document.cookie = `${TOKEN_KEY}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  },
  get: () => {
    if (typeof window === 'undefined') {
      return null
    }
    return localStorage.getItem(TOKEN_KEY)
  }
}

// 定义需要登录才能访问的路径
const PROTECTED_ROUTES = [
  '/webapp',
  '/files',
  '/admin'
];

// 检查路径是否受保护
const isProtectedRoute = (path: string) => {
  return PROTECTED_ROUTES.some(route => path.startsWith(route));
};

// 简化 AuthProvider 组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()

  const { data: currentUser, error } = trpc.user.getCurrentUser.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    enabled: !!tokenUtils.get()
  })

  useEffect(() => {
    if (currentUser) {
      setUser(currentUser)
    }
  }, [currentUser])

  useEffect(() => {
    const isAuthRoute = ['/login', '/register'].includes(pathname)
    const token = tokenUtils.get()
    
    if (!token && isProtectedRoute(pathname) && !isAuthRoute) {
      router.push('/login')
    }
    
    if (token && isAuthRoute) {
      router.push('/webapp')
    }
  }, [pathname, router])

  const utils = trpc.useUtils()
  
  const login = useCallback((token: string) => {
    tokenUtils.set(token)
    utils.user.getCurrentUser.invalidate()
    router.push('/webapp')
  }, [router, utils])

  const logout = useCallback(() => {
    setUser(undefined)
    tokenUtils.remove()
    router.push('/')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// 简化 useAuth hook
export function useAuth() {
  return useContext(AuthContext)
}