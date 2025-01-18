// AuthProvider.tsx

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { atom, useRecoilState } from 'recoil'
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

export const userAtom = atom<User | undefined>({
  key: 'user',
  default: undefined,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useRecoilState(userAtom)
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
  }, [currentUser, setUser])

  useEffect(() => {
    if (error) {
      console.error('Failed to fetch current user:', error)
      if (!['/login', '/register'].includes(pathname)) {
        router.push('/login')
      }
    }
  }, [error, pathname, router])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    // 设置cookie
    document.cookie = `token=${token}; path=/`
    router.push('/')
  }

  const logout = useCallback(() => {
    setUser(undefined) // 清除用户状态
    // 清除localStorage
    localStorage.removeItem('token')
    // 正确清除cookie，设置过期时间为过去时间并保持相同的path
    document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
    router.push('/login')
  }, [router])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
        {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const { user, login, logout } = useContext(AuthContext)
  const [recoilUser, setRecoilUser] = useRecoilState(userAtom)

  useEffect(() => {
    setRecoilUser(user)
  }, [user, setRecoilUser])

  return { user: recoilUser, login, logout }
}