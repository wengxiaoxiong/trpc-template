'use client'

import React, { useEffect } from 'react';
import { Header } from './Header';
import { Card, Statistic } from 'antd';
import { useRouter } from 'next/navigation';
import { FolderOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { trpc } from '@/utils/trpc/client';
import { useI18n } from '../i18n-provider';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const MainPageLayout = ({ children }: DashboardLayoutProps) => {
  const router = useRouter();
  const { t, locale } = useI18n();
  const { data: filesCount, refetch: refetchFilesCount } = trpc.minio.countFiles.useQuery();
  const { data: totalUsers } = trpc.user.getTotalUsers.useQuery();

  // 设置定时器，每分钟刷新一次数据
  useEffect(() => {
    const interval = setInterval(() => {
      refetchFilesCount();
    }, 60000); // 60000毫秒 = 1分钟

    return () => clearInterval(interval);
  }, [refetchFilesCount]);

  // 监听文件上传事件
  useEffect(() => {
    const handleFileUpload = () => {
      refetchFilesCount();
    };

    window.addEventListener('fileUploaded', handleFileUpload);
    return () => window.removeEventListener('fileUploaded', handleFileUpload);
  }, [refetchFilesCount]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6">
        <Header />
        <main className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card className='cursor-pointer shadow-sm' onClick={() => { router.push("/files") }}>
              <Statistic
                title={t("dashboard.total_files")}
                value={filesCount || 0}
                prefix={<FolderOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
            <Card className='cursor-pointer shadow-sm' onClick={() => { router.push("/admin") }}>
              <Statistic
                title={t("dashboard.total_users")}
                value={totalUsers || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3 sm:p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};