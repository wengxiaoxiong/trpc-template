import { z } from 'zod'
import { protectedProcedure, publicProcedure, router } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'

// 定义 Workflow 的 Zod schema
export const WorkflowSchema = z.object({
  id: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  name: z.string(),
  description: z.string(),
  workflow: z.string(), // 假设 workflow 是一个 JSON 字符串
  ownerId: z.number(),
})

export interface Workflow extends z.infer<typeof WorkflowSchema> {}

// 创建新 Workflow 时使用的 schema
export const WorkflowCreateSchema = WorkflowSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  ownerId: true,
})

// 修改后的 router
export const workflowRouter = router({
  getAll: protectedProcedure.query<Workflow[]>(async () => {
    const data = await prisma.comfyWorkflow.findMany()
    return data.map((d) => WorkflowSchema.parse(d)) as Workflow[]
  }),

  create: protectedProcedure
    .input(
      z.object({
        payload: WorkflowCreateSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {

      if (!ctx.user.id) {
        throw new Error('Unauthorized')
      }

      const { payload } = input
      const data = await prisma.comfyWorkflow.create({
        data: {
          ...payload,
          owner: {
            connect: { id: ctx.user.id },
          },
        },
      })
      return WorkflowSchema.parse(data)
    }),
})