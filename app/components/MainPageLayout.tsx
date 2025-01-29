'use client'

import React, { useEffect } from 'react';
import { Header } from './Header';
import { WorkflowList } from './WorkflowList';
import { trpc } from '@/utils/trpc/client';
import { Card, Statistic } from 'antd';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const MainPageLayout = ({ children }: DashboardLayoutProps) => {
  const { data: filesCount, refetch: refetchFilesCount } = trpc.minio.countFiles.useQuery();
  const { data: workflowsCount, refetch: refetchWorkflowsCount } = trpc.workflow.countWorkflows.useQuery();
  const { data: TasksCount, refetch: refetchTasksCount } = trpc.task.countTasks.useQuery();
  const { data: serversCount, refetch: refetchServersCount } = trpc.server.countServers.useQuery();

  // 设置定时器，每分钟刷新一次数据
  useEffect(() => {
    const interval = setInterval(() => {
      refetchFilesCount();
      refetchWorkflowsCount();
      refetchTasksCount();
      refetchServersCount();
    }, 60000); // 60000毫秒 = 1分钟

    return () => clearInterval(interval);
  }, [refetchFilesCount, refetchWorkflowsCount, refetchTasksCount, refetchServersCount]);

  const router = useRouter()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1440px] mx-auto px-6">
        <Header />
        <main className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className='cursor-pointer' onClick={() => { router.push("/files") }}>
              <Statistic
                title="文件总数"
                value={filesCount || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
            <Card className='cursor-pointer' onClick={() => { router.push("/workflow/upload") }}>
              <Statistic
                title="工作流总数"
                value={workflowsCount || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
            <Card className='cursor-pointer' onClick={() => { router.push("/tasks") }}>
              <Statistic
                title="任务总数"
                value={TasksCount || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
            <Card className='cursor-pointer' onClick={() => { router.push("/servers") }}>
              <Statistic
                title="服务器总数"
                value={serversCount || 0}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </div>
          {children}
        </main>
      </div>
    </div>
  );
};