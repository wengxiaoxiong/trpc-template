import { z } from 'zod';
import { publicProcedure, protectedProcedure, adminProcedure } from '@/utils/trpc';
import { router } from '@/utils/trpc';
import { TRPCError } from '@trpc/server';
import { prisma } from '@/utils/prisma';

export const configRouter = router({
  // 获取单个配置
  getConfig: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ input }) => {
      const config = await prisma.siteConfig.findUnique({
        where: { key: input.key },
      });
      
      if (!config) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `配置 ${input.key} 不存在`,
        });
      }
      
      return config;
    }),
    
  // 获取多个配置
  getConfigs: publicProcedure
    .input(z.object({ 
      keys: z.array(z.string()).optional() 
    }))
    .query(async ({ input }) => {
      const where = input.keys?.length 
        ? { key: { in: input.keys } } 
        : undefined;
        
      const configs = await prisma.siteConfig.findMany({
        where,
        orderBy: { key: 'asc' },
      });
      
      const configsMap = configs.reduce((acc: Record<string, string>, config) => {
        acc[config.key] = config.value;
        return acc;
      }, {} as Record<string, string>);
      
      return configsMap;
    }),
    
  // 获取所有配置（管理员用）
  getAllConfigs: adminProcedure
    .query(async () => {
      return await prisma.siteConfig.findMany({
        orderBy: { key: 'asc' },
      });
    }),
    
  // 更新配置（管理员用）
  updateConfig: adminProcedure
    .input(z.object({ 
      key: z.string(),
      value: z.string(),
      description: z.string().optional() 
    }))
    .mutation(async ({ input }) => {
      const { key, value, description } = input;
      
      return await prisma.siteConfig.upsert({
        where: { key },
        update: { 
          value,
          description: description !== undefined ? description : undefined
        },
        create: { 
          key, 
          value,
          description 
        },
      });
    }),
    
  // 批量更新配置（管理员用）
  updateConfigs: adminProcedure
    .input(z.array(z.object({ 
      key: z.string(),
      value: z.string(),
      description: z.string().optional() 
    })))
    .mutation(async ({ input }) => {
      const results = [];
      
      for (const config of input) {
        const result = await prisma.siteConfig.upsert({
          where: { key: config.key },
          update: { 
            value: config.value,
            description: config.description !== undefined ? config.description : undefined
          },
          create: { 
            key: config.key, 
            value: config.value,
            description: config.description 
          },
        });
        
        results.push(result);
      }
      
      return results;
    }),
    
  // 删除配置（管理员用）
  deleteConfig: adminProcedure
    .input(z.object({ key: z.string() }))
    .mutation(async ({ input }) => {
      return await prisma.siteConfig.delete({
        where: { key: input.key },
      });
    }),
}); 