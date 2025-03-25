'use client'

import { useState } from 'react'
import { Tabs, Card } from 'antd'
import { AdminLayout } from '../components/AdminLayout'
import dynamic from 'next/dynamic'
import { useI18n } from '@/app/i18n-provider'
import { SettingOutlined, NotificationOutlined } from '@ant-design/icons'

// 动态导入组件以减少初始加载大小
const SiteConfigManager = dynamic(() => import('@/app/admin/components/SiteConfigManager'), {
  loading: () => <p>加载中...</p>,
})

const NotificationManager = dynamic(() => import('@/app/admin/components/NotificationManager'), {
  loading: () => <p>加载中...</p>,
})

const { TabPane } = Tabs

export default function SettingsPage() {
  const { t } = useI18n()
  const [activeKey, setActiveKey] = useState('config')

  return (
    <AdminLayout>
      <Card title={t('admin.settings', '系统管理')}>
        <Tabs 
          activeKey={activeKey} 
          onChange={setActiveKey}
          tabPosition="left"
          style={{ minHeight: '600px' }}
        >
          <TabPane 
            tab={
              <span className="flex items-center">
                <SettingOutlined className="mr-2" />
                {t('admin.system_config', '系统配置')}
              </span>
            } 
            key="config"
          >
            <SiteConfigManager />
          </TabPane>
          
          <TabPane 
            tab={
              <span className="flex items-center">
                <NotificationOutlined className="mr-2" />
                {t('admin.notifications', '通知管理')}
              </span>
            } 
            key="notifications"
          >
            <NotificationManager />
          </TabPane>
        </Tabs>
      </Card>
    </AdminLayout>
  )
} 