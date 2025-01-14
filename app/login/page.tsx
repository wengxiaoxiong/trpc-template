'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { useState } from 'react'
import { useAuth, userAtom } from '../auth/AuthProvider'
import { useRecoilState } from 'recoil'
import { User } from '@prisma/client'
import { Input, Button, message, Form } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [user, setUser] = useRecoilState(userAtom)
  const [loading, setLoading] = useState(false)

  const { mutateAsync: loginMutation } = trpc.auth.login.useMutation({
    onSuccess: (data) => {
      login(data.token)
      setUser(data.user as unknown as User)
      message.success('登录成功')
      router.push('/')
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Logo区域 */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center">
              <i className="fas fa-cube text-white text-2xl"></i>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">ComfXYZ</h1>
            <p className="text-gray-500">高级批量ComfyUI任务处理平台</p>
          </div>

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
          <div className="text-center text-sm text-gray-500">
            <span>还没有账号？</span>
            <button className="text-blue-600 hover:text-blue-700 ml-1 !rounded-button whitespace-nowrap" onClick={() => router.push('/register')}>
              立即注册
            </button>
          </div>
        </div>

        {/* 页脚信息 */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>© 2024 ComfXYZ. All rights reserved.</p>
          <p className="mt-2">
            高性能 · 安全可靠 · 企业级批量ComfyUI任务处理解决方案
          </p>
        </div>
      </div>
    </div>
  )
}