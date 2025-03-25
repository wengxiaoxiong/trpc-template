'use client'

import { BellOutlined } from '@ant-design/icons'
import { Badge, Popover, Button } from 'antd'
import { useMemo, useState } from 'react'
import { trpc } from '@/utils/trpc/client'
import { NotificationList } from './NotificationList'
import { useI18n } from '../i18n-provider'
import { useRouter } from 'next/navigation'

export function NotificationIcon() {
  const { t } = useI18n()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  // 获取未读通知数量
  const { data: unreadData, refetch: refetchUnread } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    {
      refetchInterval: 60000, // 每分钟刷新一次
    }
  )
  
  const unreadCount = useMemo(() => {
    return unreadData?.count || 0
  }, [unreadData])
  
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    // 每次打开时刷新未读计数
    if (newOpen) {
      refetchUnread()
    }
  }
  
  const handleViewAll = () => {
    setOpen(false)
    router.push('/notifications')
  }
  
  const notificationContent = (
    <div>
      <NotificationList onReadNotification={refetchUnread} />
      <div className="mt-2 text-center">
        <Button type="link" onClick={handleViewAll}>
          {t('notification.view_all', '查看全部')}
        </Button>
      </div>
    </div>
  )
  
  return (
    <Popover
      content={notificationContent}
      title={t('notification.title', '通知')}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      arrow={false}
      overlayStyle={{ width: '350px' }}
    >
      <div className="cursor-pointer p-2 hover:bg-gray-50 rounded-full">
        <Badge count={unreadCount} overflowCount={99}>
          <BellOutlined style={{ fontSize: '20px' }} />
        </Badge>
      </div>
    </Popover>
  )
} 