import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { Client } from 'minio'
import { FileType } from '@prisma/client'

import { TaskStatus } from '@prisma/client'

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

      // 创建主任务
      const task = await prisma.task.create({
        data: {
          workflowId: workflow.id,
          ownerId: ctx.user.id,
          name: input.name,
          status: 'PENDING'
        }
      })

      // 获取X、Y、Z轴的组合
      const xGroup = workflow.paramGroups.find(g => g.name === 'X轴')
      const yGroup = workflow.paramGroups.find(g => g.name === 'Y轴')
      const zGroup = workflow.paramGroups.find(g => g.name === 'Z轴')

      // 生成所有可能的组合
      const combinations = generateCombinations(
        xGroup?.combinations || [],
        yGroup?.combinations || [],
        zGroup?.combinations || []
      )

      // 创建任务项
      await prisma.taskItem.createMany({
        data: combinations.map(combo => ({
          taskId: task.id,
          status: 'PENDING',
          params: mergeParams(workflow.content, combo),
          xValue: combo.x?.paramValues || null,
          yValue: combo.y?.paramValues || null,
          zValue: combo.z?.paramValues || null,
        }))
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
    })
})

// 工具函数
function generateCombinations(
  xCombos: any[],
  yCombos: any[],
  zCombos: any[]
) {
  const combinations = []
  
  for (const x of xCombos) {
    for (const y of yCombos) {
      for (const z of zCombos) {
        combinations.push({ x, y, z })
      }
    }
  }
  
  return combinations
}

function mergeParams(
  baseWorkflow: any,
  combo: { x?: any, y?: any, z?: any }
) {
  const workflow = JSON.parse(JSON.stringify(baseWorkflow))
  
  // 合并各轴的参数到工作流配置中
  const allParams = { ...combo.x?.paramValues, ...combo.y?.paramValues, ...combo.z?.paramValues }
  
  // 遍历参数，更新到对应的节点
  Object.entries(allParams).forEach(([nodeId, params]) => {
    if (workflow[nodeId] && typeof params === 'object') {
      workflow[nodeId].inputs = {
        ...workflow[nodeId].inputs,
        ...params
      }
    }
  })
  
  return workflow
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