'use client'

import React from 'react';
import { Button, Typography, Avatar } from 'antd';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth/AuthProvider';
import { UserOutlined } from '@ant-design/icons';
import { MinioImage } from './components/MinioImage';
import { useSiteConfig } from './components/SiteConfigProvider';
import { useI18n } from './i18n-provider';
import LanguageSwitcher from './components/LanguageSwitcher';

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { getConfigValue } = useSiteConfig();
  const { t, locale } = useI18n();
  
  // 获取配置
  const siteTitle = getConfigValue('site.title', t('title'));
  const siteDesc = getConfigValue('site.description', t('site.description'));
  const siteCopyright = getConfigValue('site.footer.copyright', `© ${getConfigValue('site.year', '2025')} ${siteTitle}. ${t('site.copyright')}`);
  const siteSlogan = getConfigValue('site.footer.slogan', t('site.slogan'));
  const logoUrl = getConfigValue('site.logo.url', '');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex flex-wrap justify-between items-center py-4 sm:py-6">
          <div className="flex items-center">
            <span className="text-xl sm:text-2xl font-bold text-indigo-600">{siteTitle}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <LanguageSwitcher />
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
                  {t('header.admin')}
                </Button>
                <Button 
                  type="link"
                  onClick={logout}
                  className="text-gray-600 hover:text-indigo-600 text-xs sm:text-sm px-1 sm:px-4"
                  size="middle"
                >
                  {t('header.logout')}
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
                  {t('header.login')}
                </Button>
                <Button 
                  type="primary"
                  onClick={() => router.push('/register')}
                  className="bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-xs sm:text-sm"
                  size="middle"
                >
                  {t('header.register')}
                </Button>
              </>
            )}
          </div>
        </nav>

        <div className="py-8 sm:py-12 md:py-20">
          <div className="text-center">
            <Title level={1} className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900">
              {siteTitle}
            </Title>
            <Paragraph className="mt-4 sm:mt-6 text-base sm:text-xl text-gray-600 max-w-3xl mx-auto px-2 sm:px-0">
              {siteDesc}
            </Paragraph>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 px-4 sm:px-0">
              {user ? (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => router.push('/webapp')}
                  className="h-10 sm:h-12 px-6 sm:px-8 text-base font-medium bg-indigo-600 border-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                >
                  {t('header.admin')}
                </Button>
              ) : (
                <>
                  <Button
                    type="primary"
                    size="large"
                    onClick={() => router.push('/login')}
                    className="h-10 sm:h-12 px-6 sm:px-8 text-base font-medium bg-indigo-600 border-indigo-600 hover:bg-indigo-700 w-full sm:w-auto"
                  >
                    {t('header.login')}
                  </Button>
                  <Button
                    type="default"
                    size="large"
                    onClick={() => window.open('https://github.com/wengxiaoxiong/trpc-template', '_blank')}
                    className="h-10 sm:h-12 px-6 sm:px-8 text-base font-medium w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    {t('common.back')}
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
                <Title level={3} className="text-lg sm:text-xl font-semibold">{t('features.development.title')}</Title>
                <Paragraph className="mt-2 text-sm sm:text-base text-gray-600">
                  {t('features.development.description')}
                </Paragraph>
              </div>
              
              <div className="p-5 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <Title level={3} className="text-lg sm:text-xl font-semibold">{t('features.storage.title')}</Title>
                <Paragraph className="mt-2 text-sm sm:text-base text-gray-600">
                  {t('features.storage.description')}
                </Paragraph>
              </div>
              <div className="p-5 sm:p-6 bg-white rounded-lg shadow-md">
                <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                </div>
                <Title level={3} className="text-lg sm:text-xl font-semibold">{t('features.architecture.title')}</Title>
                <Paragraph className="mt-2 text-sm sm:text-base text-gray-600">
                  {t('features.architecture.description')}
                </Paragraph>
              </div>
            </div>
          </div>
        </div>

        <footer className="py-8 sm:py-12 border-t border-gray-200">
          <div className="text-center">
            <p className="text-gray-600">{siteCopyright}</p>
            <p className="mt-2 text-sm text-gray-500">
              {siteSlogan}
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;