'use client'

import React, { useState, ReactNode } from 'react'
import { Layout, Menu, Button, theme } from 'antd'
import { useRouter } from 'next/navigation'
import { 
  MenuFoldOutlined, 
  MenuUnfoldOutlined, 
  UserOutlined, 
  SettingOutlined, 
  KeyOutlined,
  NotificationOutlined,
  HomeOutlined
} from '@ant-design/icons'
import { Header } from '@/app/components/Header'
import { useI18n } from '@/app/i18n-provider'

const { Sider, Content } = Layout

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const router = useRouter()
  const { t } = useI18n()
  
  const menuItems = [
    {
      key: '/admin',
      icon: <HomeOutlined />,
      label: t('admin.dashboard', '控制台'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: t('admin.users', '用户管理'),
    },
    {
      key: '/admin/invitationCodes',
      icon: <KeyOutlined />,
      label: t('admin.invitationCodes', '邀请码'),
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: t('admin.settings', '系统设置'),
    },
  ]
  
  const handleMenuClick = (e: { key: string }) => {
    router.push(e.key)
  }
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken()
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header />
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className="bg-white"
          style={{ marginTop: '1px' }}
        >
          <div className="p-4 flex justify-end">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
            />
          </div>
          <Menu
            mode="inline"
            defaultSelectedKeys={[window.location.pathname]}
            onClick={handleMenuClick}
            items={menuItems}
          />
        </Sider>
        <Layout className="p-4">
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            {children}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
} 