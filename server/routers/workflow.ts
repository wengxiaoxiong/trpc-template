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
    nodeId: z.string(),
    paramKey: z.string(),
})

const paramGroupItemSchema = z.object({
    nodeId: z.string(),
    paramKey: z.string(),
    currentValue: z.any(),
    path: z.array(z.string())
})

const paramValueSchema = z.object({
    nodeId: z.string(),
    paramKey: z.string(),
    value: z.any()
})

const paramGroupSchema = z.object({
    name: z.string(),
    params: z.array(paramGroupItemSchema),
    combinations: z.array(z.array(paramValueSchema)),
    selectedKeys: z.array(z.string())
})

const workflowInputSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    content: z.any(), // 原始工作流内容
    workflow: z.any(), // 工作流数据
    isPublic: z.boolean().optional(),
    parameters: z.array(workflowParamSchema),
    paramGroups: z.array(paramGroupSchema)
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
                    content: input.workflow, // 存储原始工作流数据
                    isPublic: input.isPublic ?? false,
                    ownerId: ctx.user.id,
                    // 创建参数
                    parameters: {
                        create: input.parameters.map(param => ({
                            name: param.name,
                            type: param.type,
                            default: param.default,
                            description: param.description,
                            required: param.required ?? false,
                            nodeId: param.nodeId,
                            paramKey: param.paramKey
                        }))
                    },
                    // 创建参数组
                    paramGroups: {
                        create: input.paramGroups.map(group => ({
                            name: group.name,
                            // 创建参数组中的参数项
                            params: {
                                create: group.params.map(param => ({
                                    nodeId: param.nodeId,
                                    paramKey: param.paramKey,
                                    currentValue: JSON.stringify(param.currentValue)
                                }))
                            },
                            // 创建参数组合
                            combinations: {
                                create: group.combinations.map(combination => ({
                                    paramValues: combination
                                }))
                            }
                        }))
                    }
                },
                include: {
                    parameters: true,
                    paramGroups: {
                        include: {
                            params: true,
                            combinations: true
                        }
                    }
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
                    paramGroups: {
                        include: {
                            params: true,
                            combinations: true
                        }
                    },
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
                    paramGroups: {
                        include: {
                            params: true,
                            combinations: true
                        }
                    },
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

            // 删除旧的数据
            await Promise.all([
                prisma.workflowParameter.deleteMany({
                    where: { workflowId: input.id }
                }),
                prisma.workflowParamGroup.deleteMany({
                    where: { workflowId: input.id }
                })
            ])

            // 更新工作流和相关数据
            const updated = await prisma.workflow.update({
                where: { id: input.id },
                data: {
                    name: input.data.name,
                    description: input.data.description,
                    content: input.data.workflow,
                    isPublic: input.data.isPublic,
                    parameters: {
                        create: input.data.parameters.map(param => ({
                            name: param.name,
                            type: param.type,
                            default: param.default,
                            description: param.description,
                            required: param.required ?? false,
                            nodeId: param.nodeId,
                            paramKey: param.paramKey
                        }))
                    },
                    paramGroups: {
                        create: input.data.paramGroups.map(group => ({
                            name: group.name,
                            params: {
                                create: group.params.map(param => ({
                                    nodeId: param.nodeId,
                                    paramKey: param.paramKey,
                                    currentValue: JSON.stringify(param.currentValue)
                                }))
                            },
                            combinations: {
                                create: group.combinations.map(combination => ({
                                    paramValues: combination
                                }))
                            }
                        }))
                    }
                },
                include: {
                    parameters: true,
                    paramGroups: {
                        include: {
                            params: true,
                            combinations: true
                        }
                    }
                }
            })

            return updated
        }),
    // 统计用户文件数
    countWorkflows: protectedProcedure
        .query(async ({ ctx }) => {
            const count = await prisma.workflow.count({
                where: {
                    ownerId: ctx.user.id
                }
            })
            return count
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