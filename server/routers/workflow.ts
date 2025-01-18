import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'

const workflowParamSchema = z.object({
    name: z.string(),
    type: z.string(),
    default: z.string().optional(),
    description: z.string().optional(),
    required: z.boolean().optional(),
})

const workflowInputSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    content: z.any(), // 工作流内容
    isPublic: z.boolean().optional(),
    parameters: z.array(workflowParamSchema).optional(),
})

export const workflowRouter = router({
    // 创建工作流
    create: protectedProcedure
        .input(workflowInputSchema)
        .mutation(async ({ input, ctx }) => {
            const workflow = await prisma.workflow.create({
                data: {
                    name: input.name,
                    description: input.description,
                    content: input.content,
                    isPublic: input.isPublic ?? false,
                    ownerId: ctx.user.id,
                    parameters: input.parameters ? {
                        create: input.parameters
                    } : undefined
                },
                include: {
                    parameters: true
                }
            })
            return workflow
        }),

    // 获取工作流列表
    list: protectedProcedure
        .query(async ({ ctx }) => {
            const workflows = await prisma.workflow.findMany({
                where: {
                    OR: [
                        { ownerId: ctx.user.id },
                        { isPublic: true }
                    ]
                },
                include: {
                    parameters: true,
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            })
            return workflows
        }),

    // 获取单个工作流详情
    getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ input, ctx }) => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: input.id },
                include: {
                    parameters: true,
                    owner: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true
                        }
                    }
                }
            })

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: '工作流不存在'
                })
            }

            if (!workflow.isPublic && workflow.ownerId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: '无权访问该工作流'
                })
            }

            return workflow
        }),

    // 更新工作流
    update: protectedProcedure
        .input(z.object({
            id: z.number(),
            data: workflowInputSchema
        }))
        .mutation(async ({ input, ctx }) => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: input.id }
            })

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: '工作流不存在'
                })
            }

            if (workflow.ownerId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: '无权修改该工作流'
                })
            }

            // 删除旧的参数
            await prisma.workflowParameter.deleteMany({
                where: { workflowId: input.id }
            })

            // 更新工作流和参数
            const updated = await prisma.workflow.update({
                where: { id: input.id },
                data: {
                    name: input.data.name,
                    description: input.data.description,
                    content: input.data.content,
                    isPublic: input.data.isPublic,
                    parameters: input.data.parameters ? {
                        create: input.data.parameters
                    } : undefined
                },
                include: {
                    parameters: true
                }
            })

            return updated
        }),

    // 删除工作流
    delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: input.id }
            })

            if (!workflow) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: '工作流不存在'
                })
            }

            if (workflow.ownerId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: '无权删除该工作流'
                })
            }

            await prisma.workflow.delete({
                where: { id: input.id }
            })

            return { success: true }
        })
}) 