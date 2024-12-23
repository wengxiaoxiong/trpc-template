'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'


interface AuthContextType {
  user: any
  login: (token: string) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      // 这里可以添加解析token获取用户信息的逻辑
      setUser({ token })
    } else if (!['/login', '/register'].includes(pathname)) {
      // 如果当前路径不是登录或注册页面，且没有token，则跳转到登录页面
      router.push('/login')
    }
  }, [router, pathname])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    setUser({ token })
    router.push('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}