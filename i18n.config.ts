import { getRequestConfig } from 'next-i18next/serverConfig';

export const i18nConfig = {
  defaultLocale: 'zh',
  locales: ['zh', 'en', 'ja'],
  localeDetection: true,
}

export default async function getConfig() {
  return getRequestConfig({
    ...i18nConfig,
  });
} 