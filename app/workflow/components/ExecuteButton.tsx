'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/utils/trpc/client'

interface ExecuteButtonProps {
  workflowId: number
}

export function ExecuteButton({ workflowId }: ExecuteButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false)
  const router = useRouter()
  const createTask = trpc.task.create.useMutation({
    onSuccess: (task) => {
      setIsExecuting(false)
      router.push(`/task/${task.id}`)
    },
    onError: (error) => {
      setIsExecuting(false)
      alert('执行失败：' + error.message)
    }
  })

  const handleExecute = async () => {
    setIsExecuting(true)
    createTask.mutate({
      workflowId,
      name: '执行任务 ' + new Date().toLocaleString()
    })
  }

  return (
    <button
      onClick={handleExecute}
      disabled={isExecuting}
      className={`px-4 py-2 rounded-md text-white ${
        isExecuting 
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-blue-500 hover:bg-blue-600'
      }`}
    >
      {isExecuting ? '执行中...' : '执行工作流'}
    </button>
  )
} 