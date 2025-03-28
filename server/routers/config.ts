import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure } from '@/utils/trpc';
import { router } from '@/utils/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/utils/prisma';
import { getTranslation } from '@/server/i18n';

export const configRouter = router({
  // 获取单个配置
  getConfig: publicProcedure
    .input(z.object({ 
      key: z.string(),
      locale: z.string().default('zh')
    }))
    .query(async ({ input, ctx }) => {
      // 获取翻译函数
      const t = (ctx.t ?? getTranslation(ctx.locale || input.locale).t)!;
      
      // 首先尝试获取通用配置（如果不是通用配置请求）
      if (input.locale !== 'common') {
        const commonConfig = await prisma.siteConfig.findUnique({
          where: { 
            key_locale: {
              key: input.key,
              locale: 'common' 
            }
          },
        });
        
        if (commonConfig) {
          return commonConfig;
        }
      }
      
      // 然后查找指定语言的配置
      const config = await prisma.siteConfig.findUnique({
        where: { 
          key_locale: {
            key: input.key,
            locale: input.locale 
          }
        },
      });
      
      if (!config) {
        // 如果找不到当前语言的配置，尝试找默认语言(zh)的配置
        if (input.locale !== 'zh' && input.locale !== 'common') {
          const defaultConfig = await prisma.siteConfig.findUnique({
            where: { 
              key_locale: {
                key: input.key,
                locale: 'zh'
              }
            },
          });
          
          if (defaultConfig) {
            return defaultConfig;
          }
        }
        
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: t('errors.config.notFound', `配置 ${input.key} 不存在`),
        });
      }
      
      return config;
    }),
    
  // 获取多个配置
  getConfigs: publicProcedure
    .input(z.object({ 
      keys: z.array(z.string()).optional(),
      locale: z.string().default('zh')
    }))
    .query(async ({ input }) => {
      // 先查找所有通用配置
      const commonConfigs = await prisma.siteConfig.findMany({
        where: {
          ...(input.keys?.length ? { key: { in: input.keys } } : {}),
          locale: 'common'
        },
        orderBy: { key: 'asc' },
      });
      
      // 再查找指定语言的配置
      const configs = await prisma.siteConfig.findMany({
        where: {
          ...(input.keys?.length ? { key: { in: input.keys } } : {}),
          locale: input.locale
        },
        orderBy: { key: 'asc' },
      });
      
      // 如果找不到某些配置项，尝试使用默认语言的配置
      if (input.locale !== 'zh') {
        const configKeys = [...commonConfigs, ...configs].map(config => config.key);
        const keysToFind = input.keys?.filter(key => !configKeys.includes(key)) || [];
        
        if (keysToFind.length > 0 || (configs.length === 0 && commonConfigs.length === 0)) {
          const defaultConfigs = await prisma.siteConfig.findMany({
            where: {
              ...(keysToFind.length > 0 ? { key: { in: keysToFind } } : {}),
              locale: 'zh'
            },
            orderBy: { key: 'asc' },
          });
          
          configs.push(...defaultConfigs);
        }
      }
      
      // 合并配置，通用配置优先级高于语言特定配置
      const mergedConfigs = [...configs, ...commonConfigs];
      
      // 如果有重复的键，保留通用配置
      const configsMap = mergedConfigs.reduce((acc: Record<string, string>, config) => {
        if (!acc[config.key] || config.locale === 'common') {
          acc[config.key] = config.value;
        }
        return acc;
      }, {} as Record<string, string>);
      
      return configsMap;
    }),
    
  // 获取所有配置（管理员用）
  getAllConfigs: adminProcedure
    .input(z.object({
      locale: z.string().optional().default('zh')
    }))
    .query(async ({ input }) => {
      // 返回指定语言的配置
      return await prisma.siteConfig.findMany({
        where: {
          locale: input.locale
        },
        orderBy: { key: 'asc' },
      });
    }),
    
  // 更新配置
  updateConfig: adminProcedure
    .input(z.object({
      key: z.string(),
      value: z.string(),
      description: z.string().optional(),
      locale: z.string().default('zh')
    }))
    .mutation(async ({ input }) => {
      return await prisma.siteConfig.upsert({
        where: { 
          key_locale: {
            key: input.key, 
            locale: input.locale
          }
        },
        update: {
          value: input.value,
          description: input.description,
        },
        create: {
          key: input.key,
          value: input.value,
          description: input.description,
          locale: input.locale,
        },
      });
    }),
    
  // 删除配置
  deleteConfig: adminProcedure
    .input(z.object({ 
      key: z.string(),
      locale: z.string().optional()
    }))
    .mutation(async ({ input }) => {
      if (input.locale) {
        // 删除特定语言的配置
        return await prisma.siteConfig.delete({
          where: { 
            key_locale: {
              key: input.key,
              locale: input.locale
            }
          },
        });
      } else {
        // 删除所有语言的同一个配置
        return await prisma.siteConfig.deleteMany({
          where: { key: input.key },
        });
      }
    }),
}); 