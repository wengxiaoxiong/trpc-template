'use client'
import { Button, Card, Table, Tag, Modal, Form, Input, Select, Switch, message } from 'antd'
import { useState } from 'react'
import { ExclamationCircleOutlined, SyncOutlined } from '@ant-design/icons'
import { trpc } from '@/utils/trpc/client'
import { MainPageLayout } from '../components/MainPageLayout'

const { confirm } = Modal

const ServerPage = () => {
    const [form] = Form.useForm()
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingServer, setEditingServer] = useState<any>(null)
    const [checkingStatus, setCheckingStatus] = useState<Record<number, boolean>>({})
    const [isCheckingAll, setIsCheckingAll] = useState(false)

    const utils = trpc.useUtils()
    const { data: servers, isLoading } = trpc.server.list.useQuery()
    
    const createServer = trpc.server.create.useMutation({
        onSuccess: async (newServer) => {
            message.success('服务器创建成功')
            utils.server.list.invalidate()
            setIsModalOpen(false)
            form.resetFields()
        }
    })

    const updateServer = trpc.server.update.useMutation({
        onSuccess: async (updatedServer) => {
            message.success('服务器更新成功')
            utils.server.list.invalidate()
            setIsModalOpen(false)
            form.resetFields()
            setEditingServer(null)
        }
    })

    const deleteServer = trpc.server.delete.useMutation({
        onSuccess: () => {
            message.success('服务器删除成功')
            utils.server.list.invalidate()
        }
    })

    const handleSubmit = async (values: any) => {
        try {
            if (editingServer) {
                await updateServer.mutateAsync({
                    id: editingServer.id,
                    ...values
                })
            } else {
                await createServer.mutateAsync(values)
            }
        } catch (error: any) {
            message.error(error.message || '操作失败')
        }
    }

    const handleDelete = (id: number) => {
        confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: '确定要删除这个服务器吗？',
            onOk: async () => {
                try {
                    await deleteServer.mutateAsync(id)
                } catch (error: any) {
                    message.error(error.message || '删除失败')
                }
            }
        })
    }

    const columns = [
        {
            title: '名称',
            dataIndex: 'name',
            key: 'name'
        },
        {
            title: '类型',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => (
                <Tag color={
                    type === 'comfyui' ? 'blue' :
                    type === 'a1111' ? 'green' :
                    'purple'
                }>
                    {type.toUpperCase()}
                </Tag>
            )
        },
        {
            title: '地址',
            dataIndex: 'address',
            key: 'address',
            render: (address: string) => (
                <a href={address} target="_blank" rel="noopener noreferrer">
                    {address}
                </a>
            )
        },
        {
            title: '状态',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'success' : 'error'}>
                    {isActive ? '在线' : '离线'}
                </Tag>
            )
        },
        {
            title: '可见性',
            dataIndex: 'isPublic',
            key: 'isPublic',
            render: (isPublic: boolean) => (
                <Tag color={isPublic ? 'blue' : 'default'}>
                    {isPublic ? '公开' : '私有'}
                </Tag>
            )
        },
        {
            title: '操作',
            key: 'action',
            render: (_: any, record: any) => (
                <div className="space-x-2">
                    <Button 
                        type="link" 
                        onClick={() => {
                            setEditingServer(record)
                            form.setFieldsValue(record)
                            setIsModalOpen(true)
                        }}
                    >
                        编辑
                    </Button>
                    <Button 
                        type="link" 
                        danger 
                        onClick={() => handleDelete(record.id)}
                    >
                        删除
                    </Button>
                </div>
            )
        }
    ]

    return (
        <MainPageLayout>
            <Card 
                title="服务器管理" 
                extra={
                    <div className="space-x-2">
                        <Button 
                            type="primary" 
                            onClick={() => {
                                setEditingServer(null)
                                form.resetFields()
                                setIsModalOpen(true)
                            }}
                        >
                            添加服务器
                        </Button>
                    </div>
                }
            >
                <Table 
                    columns={columns} 
                    dataSource={servers} 
                    loading={isLoading}
                    rowKey="id"
                />
            </Card>

            <Modal
                title={editingServer ? '编辑服务器' : '添加服务器'}
                open={isModalOpen}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsModalOpen(false)
                    setEditingServer(null)
                    form.resetFields()
                }}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="名称"
                        rules={[{ required: true, message: '请输入服务器名称' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="type"
                        label="类型"
                        rules={[{ required: true, message: '请选择服务器类型' }]}
                    >
                        <Select>
                            <Select.Option value="comfyui">ComfyUI</Select.Option>
                            <Select.Option value="a1111">A1111</Select.Option>
                            <Select.Option value="fooocus">Fooocus</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="地址"
                        rules={[
                            { required: true, message: '请输入服务器地址' },
                            { type: 'url', message: '请输入有效的URL' }
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[{ required: true, message: '请输入服务器描述' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>

                    <Form.Item
                        name="isPublic"
                        label="是否公开"
                        valuePropName="checked"
                    >
                        <Switch />
                    </Form.Item>
                </Form>
            </Modal>
        </MainPageLayout>
    )
}

export default ServerPage 