'use client'

import { Card, Table } from 'antd';
import { MainPageLayout } from '../components/MainPageLayout';
import { trpc } from '@/utils/trpc/client';
import Link from 'antd/es/typography/Link';

export default function TasksPage() {
  const { data: tasks, isLoading } = trpc.task.list.useQuery();

  if (isLoading) {
    return (
      <MainPageLayout>
        <div>加载中...</div>
      </MainPageLayout>
    );
  }

  const columns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      render: (text: string, record: any) => (
        <Link href={`/task/${record.id}`}>
          {text || '未命名任务'}
        </Link>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: string) => (
        <span className={`px-2 py-1 rounded text-sm ${
          status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
          status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
          status === 'FAILED' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status === 'COMPLETED' ? '已完成' :
           status === 'RUNNING' ? '执行中' :
           status === 'FAILED' ? '失败' :
           '等待中'}
        </span>
      ),
    },
  ];

  return (
    <MainPageLayout>
      <Card
        title="任务列表"
      >
        <Table 
          columns={columns} 
          dataSource={tasks} 
          rowKey="id" 
          pagination={false} 
        />

      </Card>

    </MainPageLayout>
  );
} 