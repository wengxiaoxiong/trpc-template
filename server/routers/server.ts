import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { z } from 'zod'

// 检查服务器状态的函数
async function checkServerStatus(url: string): Promise<boolean> {
    try {
        const response = await fetch(`${url}prompt`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });
        const ret = await response.json()
        console.log(ret)
        return response.ok;
    } catch (error) {
        return false;
    }
}

export const serverRouter = router({
    // 获取服务器总数
    countServers: protectedProcedure
        .query(async ({ ctx }) => {
            return prisma.server.count({
                where: {
                    ownerId: ctx.user.id
                }
            })
        }),

    // 检查服务器状态
    checkStatus: protectedProcedure
        .input(z.object({
            id: z.number(),
            address: z.string().url()
        }))
        .mutation(async ({ ctx, input }) => {
            // 检查权限
            const server = await prisma.server.findUnique({
                where: { id: input.id }
            });

            if (!server || (!server.isPublic && server.ownerId !== ctx.user.id)) {
                throw new Error('No permission to check this server');
            }

            const isActive = await checkServerStatus(input.address);

            // 更新服务器状态
            await prisma.server.update({
                where: { id: input.id },
                data: { isActive }
            });

            return { isActive };
        }),

    // 获取所有公开的服务器
    listPublic: publicProcedure
        .query(async () => {
            const servers = await prisma.server.findMany({
                where: {
                    isPublic: true
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                        }
                    }
                }
            });

            // 并行检查每个服务器的状态，设置超时为2秒
            const updatePromises = servers.map(async (server) => {
                const isActive = await Promise.race([
                    checkServerStatus(server.address),
                    new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
                ]).catch(() => false); // 超时返回false

                if (isActive !== server.isActive) {
                    await prisma.server.update({
                        where: { id: server.id },
                        data: { isActive }
                    });
                    server.isActive = isActive;
                }
            });

            await Promise.all(updatePromises);

            return servers;
        }),

    // 获取当前用户的所有服务器
    list: protectedProcedure
        .query(async ({ ctx }) => {
            const servers = await prisma.server.findMany({
                where: {
                    ownerId: ctx.user.id
                },
                include: {
                    owner: {
                        select: {
                            id: true,
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            // 并行检查每个服务器的状态，设置超时为2秒
            const updatePromises = servers.map(async (server) => {
                const isActive = await Promise.race([
                    checkServerStatus(server.address),
                    new Promise<boolean>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
                ]).catch(() => false); // 超时返回false

                if (isActive !== server.isActive) {
                    await prisma.server.update({
                        where: { id: server.id },
                        data: { isActive }
                    });
                    server.isActive = isActive;
                }
            });

            await Promise.all(updatePromises);

            return servers;
        }),
    // 获取单个服务器详情
    getById: protectedProcedure
        .input(z.number())
        .query(async ({ ctx, input }) => {
            const server = await prisma.server.findUnique({
                where: { id: input },
                include: {
                    owner: {
                        select: {
                            id: true,
                        }
                    }
                }
            })

            if (!server) {
                throw new Error('Server not found')
            }

            // 检查访问权限
            if (!server.isPublic && server.ownerId !== ctx.user.id) {
                throw new Error('No permission to access this server')
            }

            return server
        }),

    // 创建服务器
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            address: z.string().url(),
            type: z.enum(['comfyui', 'a1111', 'fooocus']),
            description: z.string(),
            isPublic: z.boolean().default(false)
        }))
        .mutation(async ({ ctx, input }) => {
            return prisma.server.create({
                data: {
                    ...input,
                    ownerId: ctx.user.id
                }
            })
        }),

    // 更新服务器
    update: protectedProcedure
        .input(z.object({
            id: z.number(),
            name: z.string().optional(),
            address: z.string().url().optional(),
            type: z.enum(['comfyui', 'a1111', 'fooocus']).optional(),
            description: z.string().optional(),
            isPublic: z.boolean().optional(),
            isActive: z.boolean().optional()
        }))
        .mutation(async ({ ctx, input }) => {
            const { id, ...updateData } = input

            // 检查权限
            const server = await prisma.server.findUnique({
                where: { id }
            })

            if (!server || server.ownerId !== ctx.user.id) {
                throw new Error('No permission to update this server')
            }

            return prisma.server.update({
                where: { id },
                data: updateData
            })
        }),

    // 删除服务器
    delete: protectedProcedure
        .input(z.number())
        .mutation(async ({ ctx, input }) => {
            // 检查权限
            const server = await prisma.server.findUnique({
                where: { id: input }
            })

            if (!server || server.ownerId !== ctx.user.id) {
                throw new Error('No permission to delete this server')
            }

            return prisma.server.delete({
                where: { id: input }
            })
        })
}) 