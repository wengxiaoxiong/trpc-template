// AuthProvider.tsx

'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { atom, useRecoilState } from 'recoil'
import { User } from '@prisma/client'

interface AuthContextType {
  login: (token: string) => void
  logout: () => void
  user: User|undefined
}

const AuthContext = createContext<AuthContextType>({
  login: () => {},
  logout: () => {},
  user: undefined,
})

export const userAtom = atom<User|undefined>({
  key: 'user',
  default: undefined,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useRecoilState(userAtom)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // 这里可以添加解析token获取用户信息的逻辑
    } else if (!['/login', '/register'].includes(pathname)) {
      // 如果当前路径不是登录或注册页面，且没有token，则跳转到登录页面
      router.push('/login')
    }
  }, [router, pathname])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    // 设置cookie
    document.cookie = `token=${token}; path=/`
    router.push('/')
  }

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    router.push('/login')
  }, [router])

  // 处理 token 过期的情况
  useEffect(() => {
    const checkTokenExpiration = () => {
      const token = localStorage.getItem('token')
      if (token) {
        const decodedToken = parseJwt(token)
        if (decodedToken.exp * 1000 < Date.now()) {
          logout()
        }
      }
    }

    const parseJwt = (token: string) => {
      try {
        return JSON.parse(atob(token.split('.')[1]))
      } catch (e) {
        return null
      }
    }

    const interval = setInterval(checkTokenExpiration, 1000 * 60) // 每分钟检查一次
    return () => clearInterval(interval)
  }, [logout])

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