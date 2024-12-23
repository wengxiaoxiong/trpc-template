'use client'

import { trpc } from '@/utils/trpc/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Space } from 'antd'
import { BatchTask } from '@prisma/client'

export default function Home() {
  const router = useRouter()
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([])

  const { data: tasks } = trpc.batchTask.getAll.useQuery(undefined, {
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  useEffect(() => {
    if (tasks) {
      setBatchTasks(tasks)
    }
  }, [tasks])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Batch Tasks</h1>
      <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
        {batchTasks.map((task) => (
          <Card key={task.id} title={task.name} extra={<Button type="primary">Details</Button>}>
            <p>{task.description}</p>
            <p>Status: {task.executeStatus}</p>
          </Card>
        ))}
      </Space>
    </div>
  )
}