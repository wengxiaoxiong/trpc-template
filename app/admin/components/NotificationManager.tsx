'use client'

import { useState } from 'react'
import { Button, Table, Tag, Modal, Form, Input, Select, Space, Popconfirm, message, Tabs } from 'antd'
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons'
import { trpc } from '@/utils/trpc/client'
import { useI18n } from '@/app/i18n-provider'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const { TabPane } = Tabs
const { TextArea } = Input
const { Option } = Select

export default function NotificationManager() {
  const { t } = useI18n()
  const [form] = Form.useForm()
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isPreviewVisible, setIsPreviewVisible] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [notificationType, setNotificationType] = useState<'ALL' | 'SYSTEM' | 'USER'>('ALL')
  const [previewContent, setPreviewContent] = useState({ title: '', content: '' })
  
  // 获取用户列表(用于选择发送对象)
  const { data: usersData } = trpc.user.getAllUsers.useQuery()
  
  // 获取通知列表
  const { 
    data: notificationsData, 
    refetch: refetchNotifications,
    isLoading 
  } = trpc.notification.getAllNotifications.useQuery({
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    type: notificationType
  })
  
  // 创建通知
  const { mutate: createNotification } = trpc.notification.createNotification.useMutation({
    onSuccess: () => {
      message.success(t('notification.create_success', '创建通知成功'))
      setIsModalVisible(false)
      form.resetFields()
      refetchNotifications()
    },
    onError: (error) => {
      message.error(error.message || t('notification.create_error', '创建通知失败'))
    }
  })
  
  // 删除通知
  const { mutate: deleteNotification } = trpc.notification.deleteNotification.useMutation({
    onSuccess: () => {
      message.success(t('notification.delete_success', '删除通知成功'))
      refetchNotifications()
    },
    onError: (error) => {
      message.error(error.message || t('notification.delete_error', '删除通知失败'))
    }
  })
  
  const handleAddNotification = () => {
    setIsModalVisible(true)
  }
  
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()
      
      // 处理系统通知(全局)
      if (values.isGlobal) {
        createNotification({
          title: values.title,
          content: values.content,
          type: values.type,
          isGlobal: true
        })
      } else {
        // 处理用户通知(特定用户)
        if (!values.userIds || values.userIds.length === 0) {
          message.error(t('notification.select_users', '请选择接收用户'))
          return
        }
        
        createNotification({
          title: values.title,
          content: values.content,
          type: values.type,
          isGlobal: false,
          userIds: values.userIds
        })
      }
    } catch (error) {
      console.error('提交通知表单错误:', error)
    }
  }
  
  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }
  
  const handlePreview = async () => {
    try {
      const values = await form.validateFields(['title', 'content'])
      setPreviewContent({
        title: values.title,
        content: values.content
      })
      setIsPreviewVisible(true)
    } catch (error) {
      console.error('预览通知内容错误:', error)
    }
  }
  
  const handleDeleteNotification = (id: number) => {
    deleteNotification({ id })
  }
  
  const handleTabChange = (key: string) => {
    setNotificationType(key as 'ALL' | 'SYSTEM' | 'USER')
    setCurrentPage(1)
  }
  
  const handleTableChange = (pagination: any) => {
    setCurrentPage(pagination.current)
    setPageSize(pagination.pageSize)
  }
  
  const columns = [
    {
      title: t('notification.id', 'ID'),
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: t('notification.title', '标题'),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('notification.type', '类型'),
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'SYSTEM' ? 'blue' : 'green'}>
          {type === 'SYSTEM' 
            ? t('notification.type_system', '系统') 
            : t('notification.type_user', '用户')}
        </Tag>
      ),
    },
    {
      title: t('notification.recipients', '接收数'),
      dataIndex: '_count',
      key: 'recipients',
      render: (count: any) => count.recipients,
    },
    {
      title: t('notification.global', '全站'),
      dataIndex: 'isGlobal',
      key: 'isGlobal',
      render: (isGlobal: boolean) => (
        isGlobal 
          ? <Tag color="purple">{t('common.yes', '是')}</Tag> 
          : <Tag color="default">{t('common.no', '否')}</Tag>
      ),
    },
    {
      title: t('notification.created_at', '创建时间'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: t('common.actions', '操作'),
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="small">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setPreviewContent({
                title: record.title,
                content: record.content
              })
              setIsPreviewVisible(true)
            }}
          >
            {t('notification.view', '查看')}
          </Button>
          <Popconfirm
            title={t('notification.confirm_delete', '确认删除此通知？')}
            onConfirm={() => handleDeleteNotification(record.id)}
            okText={t('common.yes', '是')}
            cancelText={t('common.no', '否')}
          >
            <Button icon={<DeleteOutlined />} size="small" danger>
              {t('common.delete', '删除')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  
  const getTypeOptions = () => [
    { value: 'SYSTEM', label: t('notification.type_system', '系统通知') },
    { value: 'USER', label: t('notification.type_user', '用户通知') },
  ]
  
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">{t('admin.notification_management', '通知管理')}</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={handleAddNotification}
        >
          {t('notification.add', '添加通知')}
        </Button>
      </div>
      
      <Tabs activeKey={notificationType} onChange={handleTabChange}>
        <TabPane tab={t('notification.all', '全部')} key="ALL" />
        <TabPane tab={t('notification.type_system', '系统通知')} key="SYSTEM" />
        <TabPane tab={t('notification.type_user', '用户通知')} key="USER" />
      </Tabs>
      
      <Table
        dataSource={notificationsData?.notifications || []}
        columns={columns}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: notificationsData?.totalCount || 0,
          showSizeChanger: true,
          showTotal: (total) => t('common.total_items', '共 {{total}} 条', { total }),
        }}
        onChange={handleTableChange}
      />
      
      {/* 添加通知模态框 */}
      <Modal 
        title={t('notification.add', '添加通知')} 
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="preview" onClick={handlePreview}>
            {t('notification.preview', '预览')}
          </Button>,
          <Button key="cancel" onClick={handleCancel}>
            {t('common.cancel', '取消')}
          </Button>,
          <Button key="submit" type="primary" onClick={handleSubmit}>
            {t('common.submit', '提交')}
          </Button>,
        ]}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            type: 'SYSTEM',
            isGlobal: true,
          }}
        >
          <Form.Item
            name="title"
            label={t('notification.title', '标题')}
            rules={[{ required: true, message: t('notification.title_required', '请输入标题') }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="content"
            label={t('notification.content', '内容')}
            rules={[{ required: true, message: t('notification.content_required', '请输入内容') }]}
            extra={
              <>
                <div>{t('notification.markdown_supported', '支持Markdown格式')}</div>
                <div className="text-gray-500 text-xs mt-1">
                  {t('notification.markdown_examples', '示例：')} 
                  <code className="bg-gray-100 px-1 rounded"># 一级标题</code>, 
                  <code className="bg-gray-100 px-1 rounded ml-1">## 二级标题</code>, 
                  <code className="bg-gray-100 px-1 rounded ml-1">**粗体**</code>, 
                  <code className="bg-gray-100 px-1 rounded ml-1">*斜体*</code>, 
                  <code className="bg-gray-100 px-1 rounded ml-1">[链接](URL)</code>
                </div>
              </>
            }
          >
            <TextArea rows={8} />
          </Form.Item>
          
          <Form.Item
            name="type"
            label={t('notification.type', '通知类型')}
            rules={[{ required: true }]}
          >
            <Select options={getTypeOptions()} />
          </Form.Item>
          
          <Form.Item
            name="isGlobal"
            valuePropName="checked"
            label={t('notification.is_global', '发送范围')}
          >
            <Select>
              <Option value={true}>{t('notification.global_all', '全站通知')}</Option>
              <Option value={false}>{t('notification.specific_users', '指定用户')}</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.isGlobal !== currentValues.isGlobal}
          >
            {({ getFieldValue }) => {
              return getFieldValue('isGlobal') === false ? (
                <Form.Item
                  name="userIds"
                  label={t('notification.select_users', '选择用户')}
                  rules={[{ required: true, message: t('notification.select_users_required', '请选择至少一个用户') }]}
                >
                  <Select
                    mode="multiple"
                    placeholder={t('notification.select_users_placeholder', '请选择用户')}
                    style={{ width: '100%' }}
                    optionFilterProp="label"
                  >
                    {usersData?.map((user: any) => (
                      <Option key={user.id} value={user.id} label={user.username}>
                        {user.username}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null;
            }}
          </Form.Item>
        </Form>
      </Modal>
      
      {/* 预览通知模态框 */}
      <Modal
        title={t('notification.preview', '预览')}
        open={isPreviewVisible}
        onCancel={() => setIsPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsPreviewVisible(false)}>
            {t('common.close', '关闭')}
          </Button>,
        ]}
      >
        <h3 className="text-lg font-medium">{previewContent.title}</h3>
        <div className="mt-4 preview-content">
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
            {previewContent.content}
          </ReactMarkdown>
        </div>
      </Modal>

      <style jsx global>{`
        .preview-content {
          overflow-wrap: break-word;
          word-wrap: break-word;
        }
        .preview-content p {
          margin-bottom: 0.5rem;
          line-height: 1.5;
        }
        .preview-content h1 {
          font-size: 1.8rem;
          font-weight: bold;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 0.3rem;
        }
        .preview-content h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-top: 1.3rem;
          margin-bottom: 0.8rem;
        }
        .preview-content h3 {
          font-size: 1.3rem;
          font-weight: bold;
          margin-top: 1.1rem;
          margin-bottom: 0.6rem;
        }
        .preview-content h4 {
          font-size: 1.1rem;
          font-weight: bold;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
        }
        .preview-content h5, 
        .preview-content h6 {
          font-weight: bold;
          margin-top: 0.8rem;
          margin-bottom: 0.4rem;
        }
        .preview-content a {
          color: #1890ff;
          text-decoration: none;
        }
        .preview-content a:hover {
          text-decoration: underline;
        }
        .preview-content img {
          max-width: 100%;
          height: auto;
        }
        .preview-content pre {
          background-color: #f6f8fa;
          border-radius: 6px;
          padding: 16px;
          overflow: auto;
        }
        .preview-content code {
          background-color: rgba(175, 184, 193, 0.2);
          border-radius: 6px;
          padding: 0.2em 0.4em;
          font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace;
        }
        .preview-content blockquote {
          border-left: 4px solid #d0d7de;
          margin-left: 0;
          padding-left: 16px;
          color: #57606a;
        }
        .preview-content table {
          border-collapse: collapse;
          width: 100%;
        }
        .preview-content table th,
        .preview-content table td {
          padding: 6px 13px;
          border: 1px solid #d0d7de;
        }
        .preview-content table tr:nth-child(2n) {
          background-color: #f6f8fa;
        }
      `}</style>
    </div>
  )
} 