'use client'

import { useState, useMemo } from 'react'
import { TaskGrid } from './TaskGrid'
import { trpc } from '@/utils/trpc/client'
import { MainPageLayout } from '@/app/components/MainPageLayout'
import { Card, Select, Space, Tag, Typography, Descriptions } from 'antd'
import { ReloadOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Option } = Select

type Axis = 'X' | 'Y' | 'Z'

export default function TaskPage({ params }: { params: { id: string } }) {
    const [xAxis, setXAxis] = useState<Axis>('X')
    const [yAxis, setYAxis] = useState<Axis>('Y')

    const { data: task } = trpc.task.getById.useQuery(parseInt(params.id))
    const { data: gridData } = trpc.task.getGridData.useQuery({
        taskId: parseInt(params.id),
        xAxis,
        yAxis
    })

    // 计算可选的轴
    const availableAxes = useMemo(() => {
        const allAxes: Axis[] = ['X', 'Y', 'Z']
        return {
            x: allAxes.filter(axis => axis !== yAxis),
            y: allAxes.filter(axis => axis !== xAxis)
        }
    }, [xAxis, yAxis])

    if (!task) return <div>加载中...</div>

    const statusConfig = {
        'PENDING': { color: 'default', text: '等待中' },
        'RUNNING': { color: 'processing', text: '执行中' },
        'COMPLETED': { color: 'success', text: '已完成' },
        'FAILED': { color: 'error', text: '失败' },
        'CANCELLED': { color: 'warning', text: '已取消' }
    }

    return (
        <MainPageLayout>
            <div className="p-4">
                <Card>
                    <div className="flex justify-between items-center mb-6">
                        <Space direction="vertical" size="small">
                            <Title level={4}>{task.name || '未命名任务'}</Title>
                            <Tag color={statusConfig[task.status as keyof typeof statusConfig]?.color || 'default'}>
                                {statusConfig[task.status as keyof typeof statusConfig]?.text || '未知状态'}
                            </Tag>
                        </Space>
                        <Space>
                            <ReloadOutlined 
                                className="cursor-pointer text-blue-500 text-lg"
                                onClick={() => window.location.reload()}
                            />
                        </Space>
                    </div>

                    <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="创建时间">
                            {new Date(task.createdAt).toLocaleString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="工作流">
                            {task.workflow?.name || '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="任务项数量">
                            {task.items?.length || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="完成数量">
                            {task.items?.filter(item => item.status === 'COMPLETED').length || 0}
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="mt-6">
                        <div className="mb-4">
                            <Space>
                                <span className="text-gray-600">选择视图轴：</span>
                                <Select
                                    value={xAxis}
                                    onChange={setXAxis}
                                    style={{ width: 120 }}
                                >
                                    {availableAxes.x.map(axis => (
                                        <Option key={axis} value={axis}>{axis}轴</Option>
                                    ))}
                                </Select>
                                <Select
                                    value={yAxis}
                                    onChange={setYAxis}
                                    style={{ width: 120 }}
                                >
                                    {availableAxes.y.map(axis => (
                                        <Option key={axis} value={axis}>{axis}轴</Option>
                                    ))}
                                </Select>
                            </Space>
                        </div>

                        {gridData && <TaskGrid data={gridData} />}
                    </div>
                </Card>
            </div>
        </MainPageLayout>
    )
} 