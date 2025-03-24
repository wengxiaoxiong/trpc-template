'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { useState, useEffect } from 'react'
import { useAuth } from '../auth/AuthProvider'
import { Input, Button, message, Form } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined } from '@ant-design/icons'
import { AuthLayout } from '../components/AuthLayout'
import { AuthHeader } from '../components/AuthHeader'
import { AuthPageLink } from '../components/AuthPageLink'
import { useI18n } from '../i18n-provider'

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [invitationCode, setInvitationCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { t } = useI18n()

  // 获取是否需要邀请码的设置
  const { data: requireInvitationCode, isLoading: isLoadingConfig } = 
    trpc.user.getRequireInvitationCodeSetting.useQuery();

  const { mutateAsync: register } = trpc.user.register.useMutation({
    onSuccess: (data) => {
      login(data.token)
      message.success(t('auth.register_success', '注册成功'))
      router.push('/')
    },
    onError: (error) => {
      setError(error.message)
      message.error(error.message)
    },
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push('/')
    }
  }, [router])

  const handleSubmit = async (values: any) => {
    if (password !== confirmPassword) {
      setError(t('auth.passwords_not_match', '两次输入的密码不一致'))
      return
    }
    setLoading(true)
    try {
      await register({ 
        username: values.username, 
        password: values.password,
        ...(values.invitationCode ? { invitationCode: values.invitationCode } : {})
      })
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthHeader />

      {/* 注册表单 */}
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

        <Form.Item
          name="confirmPassword"
          rules={[{ required: true, message: t('auth.confirm_password_required', '请确认密码') }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-400" />}
            placeholder={t('auth.confirm_password_placeholder', '请确认密码')}
            size="large"
            className="rounded-lg border-gray-300"
          />
        </Form.Item>

        {/* 邀请码字段，根据配置显示 */}
        {(requireInvitationCode || isLoadingConfig) && (
          <Form.Item
            name="invitationCode"
            rules={[
              { 
                required: requireInvitationCode, 
                message: t('auth.invitation_code_required', '请输入邀请码')
              }
            ]}
          >
            <Input
              prefix={<KeyOutlined className="text-gray-400" />}
              placeholder={t('auth.invitation_code_placeholder', '请输入邀请码')}
              size="large"
              className="rounded-lg border-gray-300"
            />
          </Form.Item>
        )}

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
            {t('auth.register', '注册')}
          </Button>
        </Form.Item>
      </Form>

      {/* 额外信息 */}
      <AuthPageLink mode="register" />
    </AuthLayout>
  )
}