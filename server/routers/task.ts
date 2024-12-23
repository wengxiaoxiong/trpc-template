import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'

// 定义 ExecuteStatus 枚举
const ExecuteStatus = z.enum(['INIT', 'RUNNING', 'SUCCESS', 'FAIL'])

// 定义 BatchTask 的 Zod schema
export const BatchTaskSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string(),
  ownerId: z.number(),
  batchSize: z.number(),
  executeStatus: ExecuteStatus,
  executeTime: z.date(),
  successWebhook: z.string().nullable(),
  successWebhookParams: z.any().nullable(),
})

export interface BatchTask extends z.infer<typeof BatchTaskSchema> {}

// 创建新 BatchTask 时使用的 schema
export const BatchTaskCreateSchema = BatchTaskSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

// 修改后的 router
export const batchTaskRouter = router({
  getAll: protectedProcedure.query<BatchTask[]>(async () => {
    const data = await prisma.batchTask.findMany()
    return data.map((d) => BatchTaskSchema.parse(d)) as BatchTask[]
  }),

  create: protectedProcedure
    .input(
      z.object({
        payload: BatchTaskCreateSchema,
      })
    )
    .mutation(async ({ input }) => {
      const { payload } = input
      const data = await prisma.batchTask.create({
        data: payload,
      })
      return BatchTaskSchema.parse(data)
    })
})