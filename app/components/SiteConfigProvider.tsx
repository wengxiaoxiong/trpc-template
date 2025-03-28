import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { trpc } from '@/utils/trpc/client';
import { useI18n } from '../i18n-provider';

interface SiteConfigContextType {
  siteConfig: Record<string, string>;
  isLoading: boolean;
  getConfigValue: (key: string, defaultValue?: string) => string;
}

// 配置的默认值
const defaultConfig: Record<string, string> = {
  'site.title': '模版项目',
  'site.description': '高级平台',
  'site.footer.copyright': '© 2025 模版项目. All rights reserved.',
  'site.footer.slogan': '这是一个基于 Next.js + tRPC + Prisma + Minio + Tailwind CSS 的现代化 Web 应用模版。您可以基于此模版快速开发您的项目。',
  'site.logo.url': '',  // 默认为空，使用内置logo
  'site.year': '2025',
};

const SiteConfigContext = createContext<SiteConfigContextType>({
  siteConfig: defaultConfig,
  isLoading: true,
  getConfigValue: (key: string, defaultValue?: string) => defaultValue || '',
});

export const useSiteConfig = () => useContext(SiteConfigContext);

interface SiteConfigProviderProps {
  children: ReactNode;
}

export const SiteConfigProvider: React.FC<SiteConfigProviderProps> = ({ children }) => {
  const [siteConfig, setSiteConfig] = useState<Record<string, string>>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);
  const { locale } = useI18n();

  // 先获取通用配置
  const { data: commonConfigData, isLoading: isCommonLoading } = trpc.config.getConfigs.useQuery({
    locale: 'common'
  });
  
  // 再获取语言特定配置
  const { data: localeConfigData, isLoading: isLocaleLoading } = trpc.config.getConfigs.useQuery({
    locale
  }, {
    enabled: !isCommonLoading // 等通用配置加载完成后再请求
  });

  useEffect(() => {
    if (!isCommonLoading && !isLocaleLoading) {
      // 合并配置，优先级：locale 配置 < common 配置 < 默认配置
      const mergedConfig = {
        ...defaultConfig,
        ...(localeConfigData || {}),
        ...(commonConfigData || {})
      };
      
      setSiteConfig(mergedConfig);
      setIsLoading(false);
    }
  }, [commonConfigData, localeConfigData, isCommonLoading, isLocaleLoading]);

  const getConfigValue = (key: string, defaultValue?: string) => {
    return siteConfig[key] || defaultValue || defaultConfig[key] || '';
  };

  return (
    <SiteConfigContext.Provider value={{ siteConfig, isLoading, getConfigValue }}>
      {children}
    </SiteConfigContext.Provider>
  );
}; 