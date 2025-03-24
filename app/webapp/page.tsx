'use client'

import React from 'react';
import { MainPageLayout } from '../components/MainPageLayout';
import { Typography } from 'antd';
import { useSiteConfig } from '../components/SiteConfigProvider';
import { useI18n } from '../i18n-provider';

const { Title, Paragraph } = Typography;

const WebApp: React.FC = () => {
  const { getConfigValue } = useSiteConfig();
  const { t } = useI18n();

  return (
    <MainPageLayout>
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <Title level={2} className="text-xl sm:text-2xl">
          {t('webapp.welcome', '欢迎使用')}
          {getConfigValue('site.title')}
        </Title>
        <Paragraph className="text-sm sm:text-base mt-2 sm:mt-4">
          {getConfigValue('site.description')}
        </Paragraph>
      </div>
    </MainPageLayout>
  );
};

export default WebApp; 