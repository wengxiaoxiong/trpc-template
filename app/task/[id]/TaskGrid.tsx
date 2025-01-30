import { TaskStatus } from '@prisma/client'
import { Table, Tag, Tooltip, Typography, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { InfoCircleOutlined } from '@ant-design/icons'
import { MinioImage } from '@/app/components/MinioImage'
import { trpc } from '@/utils/trpc/client'

const { Text } = Typography

interface TaskItem {
  id: number
  status: TaskStatus
  result: any
  error?: string
  xValue: any
  yValue: any
  zValue: any
}

interface TaskGridProps {
  data: {
    xValues: string[]
    yValues: string[]
    results: Record<string, Record<string, TaskItem>>
  }
}

interface TableDataItem {
  key: number
  yValue: string
  [key: string]: any
}

function formatParamValues(jsonStr: string): { label: React.ReactNode, tooltip: string } {
  try {
    const params = Array.isArray(JSON.parse(jsonStr)) 
      ? JSON.parse(jsonStr) 
      : Object.entries(JSON.parse(jsonStr))
    
    // 格式化参数值
    const formatValue = (value: any): React.ReactNode => {
      if (value === null || value === undefined) return '-'
      if (typeof value === 'number') return value.toString()
      if (typeof value === 'boolean') return value ? '是' : '否'
      if (typeof value === 'string') return value
      if (Array.isArray(value)) {
        return value.map(v => formatValue(v)).join(', ')
      }
      if (typeof value === 'object') {
        if ('text' in value) return value.text
        if ('value' in value) return value.value
        if ('name' in value) return value.name
        return Object.entries(value)
          .map(([k, v]) => `${k}: ${formatValue(v)}`)
          .join(', ')
      }
      return String(value)
    }

    // 生成标签组件
    const label = (
      <Space direction="vertical" size={2}>
        {params.map((item: any, index: number) => {
          // 处理数组格式
          const { nodeId, paramKey, value } = Array.isArray(params) 
            ? item 
            : { nodeId: item[0], paramKey: undefined, value: item[1] }

          const formattedValue = formatValue(value)
          
          // 如果是图片参数，显示预览
          const displayValue = paramKey?.toLowerCase().includes('image') 
            ? <PreviewImage filename={value} />
            : (
              <span className="text-gray-600">
                {typeof formattedValue === 'string' && formattedValue.length > 15 
                  ? formattedValue.slice(0, 15) + '...'
                  : formattedValue}
              </span>
            )

          return (
            <div key={index} className="flex items-center gap-1">
              <Tag color="blue">{nodeId}</Tag>
              {paramKey && <Tag color="green">{paramKey}</Tag>}
              {displayValue}
            </div>
          )
        })}
      </Space>
    )

    // 生成完整信息用于tooltip
    const tooltip = params
      .map((item: any) => {
        // 处理数组格式
        const { nodeId, paramKey, value } = Array.isArray(params)
          ? item
          : { nodeId: item[0], paramKey: undefined, value: item[1] }

        return `${nodeId}${paramKey ? ` - ${paramKey}` : ''}: ${formatValue(value)}`
      })
      .join('\n')

    return { label, tooltip }
  } catch (error) {
    console.error('格式化参数值失败:', error, jsonStr)
    return { 
      label: <Text type="secondary">{jsonStr || '默认'}</Text>, 
      tooltip: jsonStr || '默认' 
    }
  }
}

function TaskItemCell({ item }: { item: TaskItem | undefined }) {
  if (!item) return null

  const statusConfig = {
    'PENDING': { color: 'default', text: '等待中' },
    'RUNNING': { color: 'processing', text: '执行中' },
    'COMPLETED': { color: 'success', text: '已完成' },
    'FAILED': { color: 'error', text: '失败' },
    'CANCELLED': { color: 'warning', text: '已取消' }
  } as const

  return (
    <div className="text-center p-2">
      <div className="mb-2">
        <Tag color={statusConfig[item.status as keyof typeof statusConfig].color}>
          {statusConfig[item.status as keyof typeof statusConfig].text}
        </Tag>
      </div>
      {item.result?.imageUrl && (
        <MinioImage
          pathName={item.result.imageUrl}
          width={128}
          height={128}
          className="object-cover"
          preview={true}
        />
      )}
      {item.error && (
        <Tooltip title={item.error}>
          <Text type="danger" className="mt-2 block">
            <InfoCircleOutlined className="mr-1" />
            执行出错
          </Text>
        </Tooltip>
      )}
    </div>
  )
}

// 图片预览组件
function PreviewImage({ filename }: { filename: string }) {
  return (
    <MinioImage
      pathName={filename}
      width={64}
      height={64}
      className="object-cover rounded"
      preview={true}
    />
  )
}

export function TaskGrid({ data }: TaskGridProps) {
  const columns: ColumnsType<TableDataItem> = [
    {
      title: '',
      dataIndex: 'yValue',
      key: 'yValue',
      fixed: 'left' as const,
      width: 200,
      render: (value: string) => {
        const { label, tooltip } = formatParamValues(value)
        return (
          <Tooltip title={<pre>{tooltip}</pre>}>
            {label}
          </Tooltip>
        )
      }
    },
    ...data.xValues.map((x, index) => {
      const { label, tooltip } = formatParamValues(x)
      return {
        title: () => (
          <Tooltip title={<pre>{tooltip}</pre>}>
            {label}
          </Tooltip>
        ),
        dataIndex: index.toString(),
        key: index.toString(),
        width: 180,
        render: (_: any, record: TableDataItem) => {
          const item = data.results[x]?.[record.yValue]
          return <TaskItemCell item={item} />
        }
      }
    })
  ]

  const tableData = data.yValues.map((y, index) => ({
    key: index,
    yValue: y,
    ...data.xValues.reduce((acc, x, i) => ({
      ...acc,
      [i]: data.results[x]?.[y]
    }), {})
  }))

  return (
    <div className="overflow-x-auto">
      <Table
        columns={columns}
        dataSource={tableData}
        pagination={false}
        scroll={{ x: 'max-content' }}
        bordered
      />
    </div>
  )
} 