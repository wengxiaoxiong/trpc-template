'use client'

import Link from 'next/link'
import { MainPageLayout } from '../components/MainPageLayout'
import { trpc } from '@/utils/trpc/client'

export default function TasksPage() {
  const { data: tasks, isLoading } = trpc.task.list.useQuery()

  if (isLoading) {
    return (
      <MainPageLayout>
        <div>加载中...</div>
      </MainPageLayout>
    )
  }

  return (
    <MainPageLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">任务列表</h1>
        <div className="grid gap-4">
          {tasks?.map((task: any) => (
            <Link 
              key={task.id} 
              href={`/task/${task.id}`}
              className="block p-4 border rounded-lg hover:border-blue-500"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">
                    {task.name || '未命名任务'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    创建时间：{new Date(task.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                    task.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' :
                    task.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {task.status === 'COMPLETED' ? '已完成' :
                     task.status === 'RUNNING' ? '执行中' :
                     task.status === 'FAILED' ? '失败' :
                     '等待中'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </MainPageLayout>
  )
} 