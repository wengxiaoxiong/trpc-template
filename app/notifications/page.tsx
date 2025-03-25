'use client'

import { useState } from 'react'
import { Button, Card, List, Typography, Spin, Tabs, Empty, Badge } from 'antd'
import { NotificationOutlined, CheckOutlined } from '@ant-design/icons'
import { trpc } from '@/utils/trpc/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { NotificationStatus } from '@prisma/client'
import { useI18n } from '../i18n-provider'
import { Header } from '../components/Header'

const { Text, Title } = Typography
const { TabPane } = Tabs

export default function NotificationsPage() {
  const { t } = useI18n()
  const [status, setStatus] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 10
  
  // 获取通知列表
  const { 
    data, 
    isLoading,
    refetch: refetchNotifications
  } = trpc.notification.getUserNotifications.useQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    status,
  })
  
  // 标记已读
  const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetchNotifications()
    },
  })
  
  // 标记全部已读
  const handleMarkAllAsRead = () => {
    markAsRead({ all: true })
  }
  
  // 标记单个通知为已读
  const handleMarkAsRead = (notificationId: number) => {
    markAsRead({ notificationId })
  }
  
  const handleTabChange = (key: string) => {
    setStatus(key as 'ALL' | 'READ' | 'UNREAD')
    setPage(1)
  }
  
  // 格式化日期为字符串
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleString()
    }
    return date.toLocaleString()
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <Header />
        
        <Card
          title={
            <div className="flex items-center">
              <NotificationOutlined className="mr-2" />
              <span>{t('notification.title', '我的通知')}</span>
            </div>
          }
          extra={
            <Button 
              type="primary" 
              icon={<CheckOutlined />} 
              onClick={handleMarkAllAsRead}
            >
              {t('notification.mark_all_read', '全部标记为已读')}
            </Button>
          }
          className="mt-6"
        >
          <Tabs activeKey={status} onChange={handleTabChange}>
            <TabPane tab={t('notification.all', '全部')} key="ALL" />
            <TabPane 
              tab={
                <>
                  {t('notification.unread', '未读')}
                  {data?.notifications.filter(n => n.status === NotificationStatus.UNREAD).length ? (
                    <Badge 
                      count={data.notifications.filter(n => n.status === NotificationStatus.UNREAD).length} 
                      style={{ marginLeft: 5 }}
                    />
                  ) : null}
                </>
              } 
              key="UNREAD" 
            />
            <TabPane tab={t('notification.read', '已读')} key="READ" />
          </Tabs>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              {data?.notifications && data.notifications.length > 0 ? (
                <List
                  itemLayout="vertical"
                  dataSource={data.notifications}
                  renderItem={(item) => (
                    <List.Item
                      key={item.id}
                      className={`border-b last:border-0 transition-colors ${
                        item.status === NotificationStatus.UNREAD
                          ? 'bg-blue-50 hover:bg-blue-100'
                          : 'hover:bg-gray-50'
                      }`}
                      actions={[
                        <div key="time" className="text-sm text-gray-500">
                          {formatDate(item.createdAt)}
                        </div>,
                        item.status === NotificationStatus.UNREAD ? (
                          <Button
                            key="read"
                            type="link"
                            size="small"
                            onClick={() => handleMarkAsRead(item.notificationId)}
                          >
                            {t('notification.mark_read', '标记为已读')}
                          </Button>
                        ) : (
                          <Text key="read" type="secondary" className="text-sm">
                            {t('notification.read_at', '已读于')} {item.readAt ? formatDate(item.readAt) : ''}
                          </Text>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        title={<Title level={5}>{item.notification.title}</Title>}
                        description={
                          <div className="notification-content mt-3">
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-3" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                                h4: ({node, ...props}) => <h4 className="text-base font-bold my-2" {...props} />,
                                h5: ({node, ...props}) => <h5 className="text-sm font-bold my-1" {...props} />,
                                h6: ({node, ...props}) => <h6 className="text-xs font-bold my-1" {...props} />
                              }}
                            >
                              {item.notification.content}
                            </ReactMarkdown>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                  pagination={{
                    current: page,
                    pageSize,
                    total: data.totalCount,
                    onChange: (page) => setPage(page),
                    showSizeChanger: false,
                  }}
                />
              ) : (
                <Empty 
                  description={t('notification.empty', '暂无通知')} 
                  className="py-12"
                />
              )}
            </>
          )}
        </Card>
      </div>
      
      <style jsx global>{`
        .notification-content {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        .notification-content p {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .notification-content p:last-child {
          margin-bottom: 0;
        }
        .notification-content h1 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 0.3rem;
        }
        .notification-content h2 {
          font-size: 1.3rem;
          font-weight: bold;
          margin-top: 1.2rem;
          margin-bottom: 0.8rem;
        }
        .notification-content h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.6rem;
        }
        .notification-content h4, 
        .notification-content h5, 
        .notification-content h6 {
          font-weight: bold;
          margin-top: 0.8rem;
          margin-bottom: 0.5rem;
        }
        .notification-content a {
          color: #1890ff;
          text-decoration: none;
        }
        .notification-content a:hover {
          text-decoration: underline;
        }
        .notification-content img {
          max-width: 100%;
          height: auto;
        }
        .notification-content pre {
          background-color: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
          overflow: auto;
        }
        .notification-content code {
          background-color: rgba(175, 184, 193, 0.2);
          border-radius: 6px;
          padding: 0.2em 0.4em;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        }
        .notification-content blockquote {
          border-left: 4px solid #d0d7de;
          margin-left: 0;
          padding-left: 16px;
          color: #57606a;
        }
        .notification-content table {
          border-collapse: collapse;
          width: 100%;
        }
        .notification-content table th,
        .notification-content table td {
          padding: 6px 13px;
          border: 1px solid #d0d7de;
        }
        .notification-content table tr:nth-child(2n) {
          background-color: #f6f8fa;
        }
      `}</style>
    </div>
  )
} 