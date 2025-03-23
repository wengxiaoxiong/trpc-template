'use client'

import { useRouter } from 'next/navigation'

type AuthPageLinkProps = {
  mode: 'login' | 'register'
}

export function AuthPageLink({ mode }: AuthPageLinkProps) {
  const router = useRouter()
  
  return (
    <div className="text-center text-sm text-gray-500">
      {mode === 'login' ? (
        <>
          <span>还没有账号？</span>
          <button 
            className="text-blue-600 hover:text-blue-700 ml-1 !rounded-button whitespace-nowrap" 
            onClick={() => router.push('/register')}
          >
            立即注册
          </button>
        </>
      ) : (
        <>
          <span>已经有账号？</span>
          <button 
            className="text-blue-600 hover:text-blue-700 ml-1 !rounded-button whitespace-nowrap" 
            onClick={() => router.push('/login')}
          >
            立即登录
          </button>
        </>
      )}
    </div>
  )
} 