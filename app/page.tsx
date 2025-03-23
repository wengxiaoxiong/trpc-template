'use client'

import React from 'react';
import { Button, Typography, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth/AuthProvider';
import { UserOutlined } from '@ant-design/icons';
import { MinioImage } from './components/MinioImage';

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-between items-center py-4 sm:py-6">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-indigo-600">模版项目</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {user ? (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <div className="flex items-center gap-2">
                  {user.avatar ? (
                    <MinioImage
                      pathName={user.avatar}
                      width={36}
                      height={36}
                      className="rounded-full"
                      preview={false}
                    />
                  ) : (
                    <Avatar icon={<UserOutlined />} size="default" />
                  )}
                  <span className="text-gray-800 hidden sm:inline font-medium">{user.username}</span>
                </div>
                <Button 
                  type="primary"
                  onClick={() => router.push('/webapp')}
                  className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
                  size="middle"
                >
                  进入系统
                </Button>
                <Button 
                  type="link"
                  onClick={logout}
                  className="text-gray-600 hover:text-indigo-600 text-xs sm:text-sm px-1 sm:px-4"
                  size="middle"
                >
                  退出
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  type="link" 
                  onClick={() => router.push('/login')}
                  className="text-gray-600 hover:text-indigo-600 text-xs sm:text-sm px-2 sm:px-4"
                  size="middle"
                >
                  登录
                </Button>
                <Button 
                  type="primary"
                  onClick={() => router.push('/register')}
                  className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
                  size="middle"
                >
                  注册
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="py-8 sm:py-12 md:py-20">
          <div className="text-center">
            <Title level={1} className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900">
              现代化Web应用模版
            </Title>
            <Paragraph className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              基于 Next.js + tRPC + Prisma + Minio + Tailwind CSS 构建的高性能、可扩展的企业级应用模版。
              快速开发您的下一个重要项目。
            </Paragraph>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 px-4 sm:px-0">
              {user ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push('/webapp')}
                  className="h-10 sm:h-12 px-6 sm:px-8 text-base font-medium bg-indigo-600 border-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                >
                  进入应用
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push('/login')}
                    className="h-10 sm:h-12 px-6 sm:px-8 text-base font-medium bg-indigo-600 border-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  >
                    立即体验
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    onClick={() => window.open('https://github.com/wengxiaoxiong/trpc-template', '_blank')}
                    className="h-10 sm:h-12 px-6 sm:px-8 text-base font-medium w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    查看文档
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 sm:mt-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 px-4 sm:px-0">
              <div className="p-5 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                </div>
                <Title level={3} className="text-lg sm:text-xl font-semibold">高效开发</Title>
                <Paragraph className="mt-2 text-sm sm:text-base text-gray-600">
                  内置完整Auth系统，快速构建产品MVP，支持多种认证方式。
                </Paragraph>
              </div>
              
              <div className="p-5 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <Title level={3} className="text-lg sm:text-xl font-semibold">文件存储</Title>
                <Paragraph className="mt-2 text-sm sm:text-base text-gray-600">
                  基于MinIO构建的高性能对象存储系统，安全可靠地管理用户文件。
                </Paragraph>
              </div>
              <div className="p-5 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <Title level={3} className="text-lg sm:text-xl font-semibold">可扩展架构</Title>
                <Paragraph className="mt-2 text-sm sm:text-base text-gray-600">
                  基于tRPC和Prisma的架构，方便扩展和维护。
                </Paragraph>
              </div>
            </div>
          </div>
        </div>

        <footer className="py-8 sm:py-12 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">© 2024 模版项目. All rights reserved.</p>
            <p className="mt-2 text-sm text-gray-500">
              高性能 · 安全可靠 · 企业级解决方案
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;