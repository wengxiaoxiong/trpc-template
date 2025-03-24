'use client'

import { useRouter } from 'next/navigation'
import { useI18n } from '../i18n-provider'

type AuthPageLinkProps = {
  mode: 'login' | 'register'
}

export function AuthPageLink({ mode }: AuthPageLinkProps) {
  const router = useRouter()
  const { t } = useI18n()
  
  return (
    <div className="text-center text-sm text-gray-500">
      {mode === 'login' ? (
        <>
          <span>{t('auth.no_account', '还没有账号？')}</span>
          <button 
            className="text-blue-600 hover:text-blue-700 ml-1 !rounded-button whitespace-nowrap" 
            onClick={() => router.push('/register')}
          >
            {t('auth.register_now', '立即注册')}
          </button>
        </>
      ) : (
        <>
          <span>{t('auth.have_account', '已经有账号？')}</span>
          <button 
            className="text-blue-600 hover:text-blue-700 ml-1 !rounded-button whitespace-nowrap" 
            onClick={() => router.push('/login')}
          >
            {t('auth.login_now', '立即登录')}
          </button>
        </>
      )}
    </div>
  )
} 