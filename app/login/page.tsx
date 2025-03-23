'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { useState } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Input, Button, message, Form } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { MinioImage } from '../components/MinioImage'
import { AuthLayout } from '../components/AuthLayout'
import { AuthHeader } from '../components/AuthHeader'
import { AuthPageLink } from '../components/AuthPageLink'
import { Logo } from '../components/Logo'

export default function LoginPage() {
  const router = useRouter()
  const { login, logout, user } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { mutateAsync: loginMutation } = trpc.user.login.useMutation({
    onSuccess: (data) => {
      login(data.token)
      message.success('登录成功')
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

  // 如果用户已登录，显示已登录状态
  if (user) {
    return (
      <AuthLayout>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 mb-4">
            您已登录
          </div>
          <div className="text-gray-600 mb-6 text-center flex items-center justify-evenly flex-col space-y-4 h-36">
            <MinioImage pathName={user.avatar || ''} className="rounded-full mx-auto" />
            当前登录账号：{user.username}
          </div>
          <Button
            type="primary"
            size="large"
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4"
            onClick={() => router.push('/webapp')}
          >
            进入应用
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
            切换账号
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <AuthHeader />

      {/* 登录表单 */}
      <Form onFinish={handleSubmit} layout="vertical">
        <Form.Item
          name="username"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input
            prefix={<UserOutlined className="text-gray-400" />}
            placeholder="请输入用户名"
            size="large"
            className="rounded-lg border-gray-300"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder="请输入密码"
            size="large"
            className="rounded-lg border-gray-300"
          />
        </Form.Item>

        <Form.Item className="mb-4">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-11 bg-gradient-to-r from-blue-500 to-indigo-600 !rounded-button"
            loading={loading}
          >
            登录
          </Button>
        </Form.Item>
      </Form>

      {/* 额外信息 */}
      <AuthPageLink mode="login" />
    </AuthLayout>
  )
}