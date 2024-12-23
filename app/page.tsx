'use client'

import { trpc } from '@/utils/trpc/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { BatchTask } from '@/server/routers/task'

export default function Home() {
  const router = useRouter()
  const [batchTasks, setBatchTasks] = useState<BatchTask[]>([])
  
  // Use the TRPC hook instead of direct caller
  const { data: tasks } = trpc.batchTask.getAll.useQuery(undefined, {
    // Don't fetch if there's no token
    enabled: typeof window !== 'undefined' && !!localStorage.getItem('token'),
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
  }, [router])

  // Update state when data changes
  useEffect(() => {
    if (tasks) {
      setBatchTasks(tasks)
    }
  }, [tasks])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Batch Tasks</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchTasks.map((task) => (
          <div key={task.id} className="border p-4 rounded-md shadow-sm">
            <h2 className="text-lg font-semibold">{task.name}</h2>
            <p className="text-sm text-gray-500">{task.description}</p>
            <p className="text-sm mt-2">Status: {task.executeStatus}</p>
          </div>
        ))}
      </div>
    </div>
  )
}