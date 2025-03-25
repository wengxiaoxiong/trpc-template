'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Input, Button, message, Form, Divider } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { MinioImage } from '../components/MinioImage'
import { AuthLayout } from '../components/AuthLayout'
import { AuthHeader } from '../components/AuthHeader'
import { AuthPageLink } from '../components/AuthPageLink'
import { Logo } from '../components/Logo'
import { useI18n } from '../i18n-provider'
import GoogleLoginButton from '@/app/components/GoogleLoginButton'

// 声明 google 全局变量
declare global {
  interface Window {
    google: {
      accounts: {
        oauth2: {
          initCodeClient(config: {
            client_id: string;
            scope: string;
            redirect_uri: string;
            callback: (response: { code: string }) => void;
          }): { requestCode(): void };
        };
      };
    };
  }
}

export default function LoginPage() {
  const router = useRouter()
  const { login, logout, user } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  const { mutateAsync: loginMutation } = trpc.user.login.useMutation({
    onSuccess: (data) => {
      login(data.token)
      message.success(t('auth.login_success', '登录成功'))
      router.push('/webapp')
    },
    onError: (error) => {
      setError(error.message)
      message.error(error.message)
    },
  })

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      await loginMutation({ username: values.username, password: values.password })
    } catch (error) {
      setLoading(false)
    }
  }

  // 处理Google登录成功
  const handleGoogleLoginSuccess = (data: any) => {
    if (data && data.token) {
      try {
        // 保存token到localStorage
        localStorage.setItem('authToken', data.token);
        
        // 保存用户信息到localStorage
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
        }
        
        // 调用登录函数并跳转
        login(data.token);
        message.success(t('auth.login_success', '登录成功'));
        router.push('/webapp');
      } catch (err) {
        console.error('保存登录信息出错:', err);
        message.error(t('auth.login_error', '登录处理失败，请重试'));
      }
    } else {
      message.error(t('auth.google_login_error', 'Google 登录失败'));
    }
  };

  // 处理Google登录错误
  const handleGoogleLoginError = (error: Error) => {
    message.error(error.message || t('auth.google_login_error', 'Google 登录失败'))
  }

  // 如果用户已登录，显示已登录状态
  if (user) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-4">
            {t('auth.already_logged_in', '您已登录')}
          </div>
          <div className="text-gray-600 mb-6 text-center flex items-center justify-evenly flex-col space-y-4 h-36">
            <MinioImage pathName={user.avatar || ''} className="rounded-full mx-auto" />
            {t('auth.current_account', '当前登录账号')}：{user.username}
          </div>
          <Button
            type="primary"
            size="large"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4"
            onClick={() => router.push('/webapp')}
          >
            {t('auth.enter_app', '进入应用')}
          </Button>
          <Button
            type="link"
            size="large"
            className="w-full"
            onClick={() => {
              logout()
              setUsername('')
              setPassword('')
            }}
          >
            {t('auth.switch_account', '切换账号')}
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthHeader />

      {/* 新的Google登录按钮组件 */}
      <GoogleLoginButton 
        onLoginSuccess={handleGoogleLoginSuccess}
        onLoginError={handleGoogleLoginError}
        buttonText={t('auth.google_login', '使用 Google 账号登录')}
        className="w-full h-11 mb-4"
      />

      <Divider>{t('auth.or', '或')}</Divider>

      {/* 登录表单 */}
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          rules={[{ required: true, message: t('auth.username_required', '请输入用户名') }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder={t('auth.username_placeholder', '请输入用户名')}
            size="large"
            className="rounded-lg border-gray-300"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: t('auth.password_required', '请输入密码') }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.password_placeholder', '请输入密码')}
            size="large"
            className="rounded-lg border-gray-300"
          />
        </Form.Item>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 !rounded-button"
            loading={loading}
          >
            {t('auth.login', '登录')}
          </Button>
        </Form.Item>
      </Form>

      {/* 额外信息 */}
      <AuthPageLink mode="login" />
    </AuthLayout>
  )
}