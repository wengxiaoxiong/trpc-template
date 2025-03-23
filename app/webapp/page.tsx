'use client'

import React from 'react';
import { MainPageLayout } from '../components/MainPageLayout';
import { Typography } from 'antd';

const { Title, Paragraph } = Typography;

const WebApp: React.FC = () => {
  return (
    <MainPageLayout>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <Title level={2}>欢迎使用模版项目</Title>
        <Paragraph>
          这是一个基于 Next.js + tRPC + Prisma + Minio + Tailwind CSS 的现代化 Web 应用模版。
          您可以基于此模版快速开发您的项目。
        </Paragraph>
      </div>
    </MainPageLayout>
  );
};

export default WebApp; 