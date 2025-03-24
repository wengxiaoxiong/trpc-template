'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import i18next from 'i18next';
import { initReactI18next, useTranslation as useTranslationOriginal } from 'react-i18next';

// 初始化i18next
i18next
  .use(initReactI18next)
  .init({
    lng: 'zh', // 默认语言
    fallbackLng: 'zh',
    supportedLngs: ['zh', 'en', 'ja'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    resources: {
      zh: {
        common: require('../public/locales/zh/common.json'),
      },
      en: {
        common: require('../public/locales/en/common.json'),
      },
      ja: {
        common: require('../public/locales/ja/common.json'),
      },
    },
  });

// 创建国际化上下文
interface I18nContextType {
  locale: string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'zh',
  setLocale: () => {},
});

// 支持的语言
export const supportedLocales = ['zh', 'en', 'ja'];
const defaultLocale = 'zh';
const LOCALE_STORAGE_KEY = 'app_locale';

// 国际化提供器组件
export function I18nProvider({ children }: { children: ReactNode }) {
  // 从localStorage读取语言设置，如果没有则使用默认语言
  const getInitialLocale = (): string => {
    if (typeof window === 'undefined') return defaultLocale;
    
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (savedLocale && supportedLocales.includes(savedLocale)) {
      return savedLocale;
    }
    
    // 如果没有保存的语言设置，尝试从浏览器语言中获取
    const browserLang = navigator.language.split('-')[0];
    if (supportedLocales.includes(browserLang)) {
      return browserLang;
    }
    
    return defaultLocale;
  };
  
  const [locale, setLocaleState] = useState<string>(defaultLocale);
  
  // 初始化语言设置
  useEffect(() => {
    const initialLocale = getInitialLocale();
    setLocaleState(initialLocale);
    i18next.changeLanguage(initialLocale);
  }, []);

  // 切换语言
  const changeLocale = (newLocale: string) => {
    if (newLocale === locale || !supportedLocales.includes(newLocale)) return;
    
    // 更新状态和i18next实例
    i18next.changeLanguage(newLocale);
    setLocaleState(newLocale);
    
    // 保存到localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCALE_STORAGE_KEY, newLocale);
    }
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale: changeLocale }}>
      {children}
    </I18nContext.Provider>
  );
}

// 自定义钩子以便在组件中使用国际化
export function useI18n() {
  const context = useContext(I18nContext);
  const { t } = useTranslationOriginal();

  return {
    t,
    locale: context.locale,
    setLocale: context.setLocale,
  };
} 