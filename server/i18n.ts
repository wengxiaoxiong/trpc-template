import fs from 'fs';
import path from 'path';

// 定义支持的语言
export const supportedLocales = ['zh', 'en', 'ja'];
const defaultLocale = 'zh';

// 缓存翻译资源
const translations: Record<string, Record<string, any>> = {};

// 加载翻译文件
for (const locale of supportedLocales) {
  const filePath = path.join(process.cwd(), 'public', 'locales', locale, 'common.json');
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    translations[locale] = JSON.parse(content);
  } catch (error) {
    console.error(`Error loading translation file for ${locale}:`, error);
    translations[locale] = {};
  }
}

// 获取翻译函数
export function getTranslation(locale: string = defaultLocale) {
  const currentLocale = supportedLocales.includes(locale) ? locale : defaultLocale;
  
  return {
    t: (key: string, defaultValue: string = key) => {
      const keyParts = key.split('.');
      let result = translations[currentLocale];
      
      // 逐级查找翻译键
      for (const part of keyParts) {
        if (result && typeof result === 'object' && part in result) {
          result = result[part];
        } else {
          return defaultValue;
        }
      }
      
      return typeof result === 'string' ? result : defaultValue;
    },
    locale: currentLocale
  };
}

// 国际化中间件
export function createI18nMiddleware() {
  return async ({ ctx, next }: any) => {
    // 从请求头中获取语言偏好
    const locale = ctx.req?.headers?.['accept-language']?.split(',')[0]?.split('-')[0] || defaultLocale;
    ctx.locale = supportedLocales.includes(locale) ? locale : defaultLocale;
    ctx.t = getTranslation(ctx.locale).t;
    
    return next({
      ctx: {
        ...ctx,
        locale: ctx.locale,
        t: ctx.t
      }
    });
  };
} 