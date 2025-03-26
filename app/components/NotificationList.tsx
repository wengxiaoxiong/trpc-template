'use client'

import { Empty, List, Typography, Button, Spin, Tabs, Modal } from 'antd'
import { trpc } from '@/utils/trpc/client'
import { useState } from 'react'
import { NotificationStatus } from '@prisma/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useI18n } from '../i18n-provider'

const { Text } = Typography
const { TabPane } = Tabs

interface NotificationListProps {
  onReadNotification?: () => void
}

// 定义组件内通知类型
interface NotificationItem {
  id: number
  notificationId: number
  userId: number
  status: NotificationStatus
  createdAt: Date
  readAt: Date | null
  notification: {
    id: number
    title: string
    content: string
    type: string
    isGlobal: boolean
  }
}

export function NotificationList({ onReadNotification }: NotificationListProps) {
  const { t } = useI18n()
  const [status, setStatus] = useState<'ALL' | 'READ' | 'UNREAD'>('ALL')
  const [page, setPage] = useState(1)
  const pageSize = 5
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  
  // 获取通知列表
  const { data, isLoading, refetch } = trpc.notification.getUserNotifications.useQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    status,
  })
  
  // 标记通知为已读
  const { mutate: markAsRead } = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      refetch()
      if (onReadNotification) {
        onReadNotification()
      }
    },
  })
  
  // 标记全部为已读
  const handleMarkAllAsRead = () => {
    markAsRead({ all: true })
  }
  
  // 标记单个通知为已读
  const handleMarkAsRead = (notificationId: number) => {
    markAsRead({ notificationId })
  }
  
  const handleTabChange = (key: string) => {
    setStatus(key as 'ALL' | 'READ' | 'UNREAD')
    setPage(1) // 切换tab时重置页码
  }
  
  const formatDate = (date: Date | string) => {
    if (typeof date === 'string') {
      return new Date(date).toLocaleString()
    }
    return date.toLocaleString()
  }
  
  // 处理查看通知详情
  const handleViewDetail = (item: NotificationItem) => {
    setSelectedNotification(item)
    setDetailModalVisible(true)
    if (item.status === NotificationStatus.UNREAD) {
      handleMarkAsRead(item.notificationId)
    }
  }
  
  // 截断内容文本
  const truncateContent = (content: string, maxLength = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }
  
  return (
    <div className="notifications-list">
      <div className="flex justify-between items-center mb-2">
        <Tabs 
          activeKey={status} 
          onChange={handleTabChange}
          size="small"
          className="mb-0 w-full"
        >
          <TabPane tab={t('notification.all', '全部')} key="ALL" />
          <TabPane tab={t('notification.unread', '未读')} key="UNREAD" />
          <TabPane tab={t('notification.read', '已读')} key="READ" />
        </Tabs>
        <Button 
          type="link" 
          size="small" 
          onClick={handleMarkAllAsRead}
          className="whitespace-nowrap"
        >
          {t('notification.mark_all_read', '全部已读')}
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-5">
          <Spin />
        </div>
      ) : (
        <>
          {data?.notifications && data.notifications.length > 0 ? (
            <List
              dataSource={data.notifications}
              renderItem={(item) => (
                <List.Item 
                  className={`cursor-pointer hover:bg-blue-50 transition-colors p-3 ${
                    item.status === NotificationStatus.UNREAD 
                      ? 'bg-blue-50' 
                      : ''
                  }`}
                  onClick={() => {
                    if (item.status === NotificationStatus.UNREAD) {
                      handleMarkAsRead(item.notificationId)
                    }
                  }}
                >
                  <div className="w-full">
                    <div className="flex justify-between items-center">
                      <Text strong>{item.notification.title}</Text>
                      <Text type="secondary" className="text-xs">
                        {formatDate(item.createdAt)}
                      </Text>
                    </div>
                    <div className="mt-2 text-sm notification-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                          h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                          h3: ({node, ...props}) => <h3 className="text-base font-bold my-1" {...props} />,
                          h4: ({node, ...props}) => <h4 className="text-sm font-bold my-1" {...props} />,
                          h5: ({node, ...props}) => <h5 className="text-xs font-bold my-1" {...props} />,
                          h6: ({node, ...props}) => <h6 className="text-xs font-semibold my-1" {...props} />
                        }}
                      >
                        {truncateContent(item.notification.content)}
                      </ReactMarkdown>
                    </div>
                    {item.notification.content.length > 100 && (
                      <div className="mt-1 text-right">
                        <Button 
                          type="link" 
                          size="small" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(item);
                          }}
                        >
                          {t('notification.view_detail', '查看详情')}
                        </Button>
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
              pagination={{
                current: page,
                pageSize,
                total: data.totalCount,
                onChange: (page) => setPage(page),
                size: 'small',
                simple: true,
              }}
            />
          ) : (
            <Empty 
              description={t('notification.empty', '暂无通知')} 
              image={Empty.PRESENTED_IMAGE_SIMPLE} 
            />
          )}
        </>
      )}
      
      {/* 通知详情弹窗 */}
      <Modal
        title={selectedNotification?.notification.title}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            {t('common.close', '关闭')}
          </Button>
        ]}
        width={600}
      >
        {selectedNotification && (
          <div className="notification-detail-content">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-bold my-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold my-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold my-1" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-sm font-bold my-1" {...props} />,
                h5: ({node, ...props}) => <h5 className="text-xs font-bold my-1" {...props} />,
                h6: ({node, ...props}) => <h6 className="text-xs font-semibold my-1" {...props} />
              }}
            >
              {selectedNotification.notification.content}
            </ReactMarkdown>
          </div>
        )}
      </Modal>
      
      <style jsx global>{`
        .notifications-list .notification-content {
          overflow-wrap: break-word;
          word-wrap: break-word;
          max-height: 200px;
          overflow: hidden;
        }
        .notifications-list .notification-content p {
          margin-bottom: 0.5rem;
        }
        .notifications-list .notification-content p:last-child {
          margin-bottom: 0;
        }
        .notifications-list .notification-content h1 {
          font-size: 1.3rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          border-bottom: 1px solid #eaeaea;
          padding-bottom: 0.2rem;
        }
        .notifications-list .notification-content h2 {
          font-size: 1.2rem;
          font-weight: bold;
          margin-top: 0.8rem;
          margin-bottom: 0.4rem;
        }
        .notifications-list .notification-content h3 {
          font-size: 1.1rem;
          font-weight: bold;
          margin-top: 0.6rem;
          margin-bottom: 0.3rem;
        }
        .notifications-list .notification-content h4,
        .notifications-list .notification-content h5,
        .notifications-list .notification-content h6 {
          font-weight: bold;
          margin-top: 0.5rem;
          margin-bottom: 0.3rem;
        }
        .notifications-list .notification-content a {
          color: #1890ff;
          text-decoration: none;
        }
        .notifications-list .notification-content a:hover {
          text-decoration: underline;
        }
        .notifications-list .notification-content img {
          max-width: 100%;
          height: auto;
        }
        .notifications-list .notification-content pre {
          background-color: #f6f8fa;
          border-radius: 3px;
          padding: 8px;
          overflow: auto;
          font-size: 85%;
        }
        .notifications-list .notification-content code {
          background-color: rgba(175, 184, 193, 0.2);
          border-radius: 3px;
          padding: 0.2em 0.4em;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
          font-size: 85%;
        }
        
        .notification-detail-content {
          max-height: 70vh;
          overflow-y: auto;
          padding: 8px 0;
        }
        .notification-detail-content img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
    </div>
  )
} 