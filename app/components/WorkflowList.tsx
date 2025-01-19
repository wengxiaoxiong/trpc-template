import { Card, Table, Button, Tag, message } from 'antd'
import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export const WorkflowList = () => {
  const router = useRouter()
  const { data: workflows, isLoading, refetch } = trpc.workflow.list.useQuery()
  const deleteWorkflow = trpc.workflow.delete.useMutation({
    onSuccess: () => {
      message.success('删除成功')
      refetch() // 刷新列表
    },
    onError: () => {
      message.error('删除失败')
    }
  })
  const handleDelete = (id: string) => {
    deleteWorkflow.mutate({ id: parseInt(id) })
  }

  const columns = [
    {
      title: '工作流名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <span className="font-medium">{text}</span>
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => <span className="text-gray-500">{text || '-'}</span>
    },
    {
      title: '创建者',
      dataIndex: 'owner',
      key: 'owner',
      render: (owner: any) => <span>{owner.username}</span>
    },
    {
      title: '参数配置',
      key: 'params',
      render: (record: any) => (
        <div className="space-y-1">
          {record.paramGroups.map((group: any, index: number) => {
            const combinationCount = group.combinations?.length || 0
            return (
              <Tag 
                key={index} 
                color={index === 0 ? 'blue' : index === 1 ? 'green' : 'purple'}
                className="whitespace-normal"
              >
                {group.name}: {group.params.length}个字段 {combinationCount > 0 ? `${combinationCount}个组合` : ''}
              </Tag>
            )
          })}
        </div>
      )
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => (
        <span className="text-gray-500">
          {formatDistanceToNow(new Date(date), { addSuffix: true, locale: zhCN })}
        </span>
      )
    },
    {
      title: '状态',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic: boolean) => (
        <Tag color={isPublic ? 'green' : 'blue'}>
          {isPublic ? '公开' : '私有'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      render: (record: any) => (
        <div className="space-x-2">
          <Button 
            type="link" 
            onClick={() => router.push(`/edit_workflow/${record.id}`)}
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
    <div className="grid gap-6">
      <Card title="我的工作流" className="col-span-full">
        <Table
          columns={columns}
          dataSource={workflows}
          rowKey="id"
          loading={isLoading}
        />
      </Card>
    </div>
  )
}