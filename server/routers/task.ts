import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { Client } from 'minio'
import { FileType, Prisma } from '@prisma/client'

import { TaskStatus } from '@prisma/client'

interface AxisCombo {
    paramValues: Prisma.InputJsonValue
}

interface Combination {
    x?: AxisCombo
    y?: AxisCombo
    z?: AxisCombo
}

export const taskRouter = router({
    // 获取任务列表
    list: protectedProcedure
        .query(async ({ ctx }) => {
            return prisma.task.findMany({
                where: {
                    ownerId: ctx.user.id
                },
                orderBy: {
                    createdAt: 'desc'
                },
                include: {
                    workflow: {
                        select: {
                            name: true
                        }
                    }
                }
            })
        }),

    // 创建任务
    create: protectedProcedure
        .input(z.object({
            workflowId: z.number(),
            name: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const workflow = await prisma.workflow.findUnique({
                where: { id: input.workflowId },
                include: {
                    paramGroups: {
                        include: {
                            combinations: true
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

            // 获取各轴的组合
            const xGroup = workflow.paramGroups.find(g => g.name === 'X轴')
            const yGroup = workflow.paramGroups.find(g => g.name === 'Y轴')
            const zGroup = workflow.paramGroups.find(g => g.name === 'Z轴')

            // 生成所有可能的组合
            const combinations = generateCombinations(
                xGroup?.combinations as AxisCombo[] || null,
                yGroup?.combinations as AxisCombo[] || null,
                zGroup?.combinations as AxisCombo[] || null
            )

            // 如果没有任何组合，创建一个默认任务项
            if (combinations.length === 0) {
                const task = await prisma.task.create({
                    data: {
                        workflowId: workflow.id,
                        ownerId: ctx.user.id,
                        name: input.name,
                        status: TaskStatus.INIT,
                        items: {
                            create: [{
                            status: TaskStatus.INIT,
                                params: workflow.content as Prisma.InputJsonValue,
                                xValue: Prisma.JsonNull,
                                yValue: Prisma.JsonNull,
                                zValue: Prisma.JsonNull
                            }]
                        }
                    }
                })
                return task
            }

            // 创建主任务和任务项
            const task = await prisma.task.create({
                data: {
                    workflowId: workflow.id,
                    ownerId: ctx.user.id,
                    name: input.name,
                    status: TaskStatus.INIT,
                    items: {
                        create: combinations.map(combo => ({
                            status: TaskStatus.INIT,
                            params: mergeParams(workflow.content, combo),
                            xValue: combo.x?.paramValues || Prisma.JsonNull,
                            yValue: combo.y?.paramValues || Prisma.JsonNull,
                            zValue: combo.z?.paramValues || Prisma.JsonNull
                        }))
                    }
                }
            })

            return task
        }),

    // 获取任务详情
    getById: protectedProcedure
        .input(z.number())
        .query(async ({ ctx, input }) => {
            return prisma.task.findUnique({
                where: { id: input },
                include: {
                    items: true,
                    workflow: {
                        include: {
                            paramGroups: true
                        }
                    }
                }
            })
        }),

    // 获取任务网格数据
    getGridData: protectedProcedure
        .input(z.object({
            taskId: z.number(),
            xAxis: z.enum(['X', 'Y', 'Z']),
            yAxis: z.enum(['X', 'Y', 'Z'])
        }))
        .query(async ({ input }) => {
            const task = await prisma.task.findUnique({
                where: { id: input.taskId },
                include: {
                    items: true
                }
            })

            if (!task) throw new TRPCError({
                code: 'NOT_FOUND',
                message: '任务不存在'
            })

            return formatGridData(task.items, input.xAxis, input.yAxis)
        }),
    countTasks: protectedProcedure
        .query(async ({ ctx }) => {
            const count = await prisma.task.count({
                where: {
                    ownerId: ctx.user.id
                }
            })
            return count
        }),
})

// 工具函数
function generateCombinations(
    xCombos: AxisCombo[] | null,
    yCombos: AxisCombo[] | null,
    zCombos: AxisCombo[] | null
): Combination[] {
    // 过滤掉没有组合的轴
    const axes = [
        { name: 'x' as const, combos: xCombos },
        { name: 'y' as const, combos: yCombos },
        { name: 'z' as const, combos: zCombos }
    ].filter(axis => axis.combos && axis.combos.length > 0)

    // 如果没有任何轴有组合，返回空数组
    if (axes.length === 0) {
        return []
    }

    // 生成组合
    let combinations: Combination[] = [{}]
    
    axes.forEach(axis => {
        const newCombinations: Combination[] = []
        combinations.forEach(combo => {
            axis.combos!.forEach(axisCombo => {
                newCombinations.push({
                    ...combo,
                    [axis.name]: axisCombo
                })
            })
        })
        combinations = newCombinations
    })

    return combinations
}

function mergeParams(
    baseWorkflow: any,
    combo: Combination
): Prisma.InputJsonValue {
    const workflow = JSON.parse(JSON.stringify(baseWorkflow))

    // 收集所有参数
    const paramUpdates: Record<string, Record<string, any>> = {}

    // 处理每个轴的参数
    ;[combo.x, combo.y, combo.z].forEach(axisCombo => {
        if (!axisCombo?.paramValues) return
        
        // 确保 paramValues 是数组格式
        const params = Array.isArray(axisCombo.paramValues) 
            ? axisCombo.paramValues 
            : [axisCombo.paramValues]

        // 处理每个参数项
        params.forEach((param: any) => {
            if (param.nodeId && param.paramKey && 'value' in param) {
                if (!paramUpdates[param.nodeId]) {
                    paramUpdates[param.nodeId] = {}
                }
                paramUpdates[param.nodeId][param.paramKey] = param.value
            }
        })
    })

    // 更新工作流中的参数
    Object.entries(paramUpdates).forEach(([nodeId, params]) => {
        if (workflow[nodeId] && workflow[nodeId].inputs) {
            workflow[nodeId].inputs = {
                ...workflow[nodeId].inputs,
                ...params
            }
        }
    })

    return workflow as Prisma.InputJsonValue
}

function formatGridData(items: any[], xAxis: string, yAxis: string) {
    const xValues = Array.from(new Set(items.map(item => JSON.stringify(item[`${xAxis.toLowerCase()}Value`]))));
    const yValues = Array.from(new Set(items.map(item => JSON.stringify(item[`${yAxis.toLowerCase()}Value`]))));

    const results: Record<string, Record<string, any>> = {}
    items.forEach(item => {
        const xKey = JSON.stringify(item[`${xAxis.toLowerCase()}Value`])
        const yKey = JSON.stringify(item[`${yAxis.toLowerCase()}Value`])

        if (!results[xKey]) {
            results[xKey] = {}
        }
        results[xKey][yKey] = item
    })

    return {
        xValues,
        yValues,
        results
    }
} 