import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { Client } from 'minio'

// Minio 客户端配置
const minioClient = new Client({
    endPoint: 'localhost',
    port: 9001,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'wsk779yxZAoghq5ExAwZ',
    secretKey: process.env.MINIO_SECRET_KEY || 'MLM2GXUuHenu08bL899pADzMNO7UZNAvl6Lo8ZCA'
})

const BUCKET_NAME = 'comfxyz'

// 文件信息的 Schema
const fileInfoSchema = z.object({
    name: z.string(),
    size: z.number(),
    type: z.string(),
    path: z.string(),
    description: z.string().optional()
})

export const minioRouter = router({
    // 获取临时凭证
    // 获取临时凭证
    getCredentials: protectedProcedure
        .query(async ({ ctx }) => {
            try {
                const policy = {
                    Version: '2012-10-17',
                    Statement: [
                        {
                            Effect: 'Allow',
                            Action: [
                                's3:GetObject',
                                's3:PutObject',
                                's3:ListBucket'
                            ],
                            Resource: [
                                `arn:aws:s3:::${BUCKET_NAME}/*`,
                                `arn:aws:s3:::${BUCKET_NAME}`
                            ]
                        }
                    ]
                }

                // MinIO 提供了一个更简单的方式来生成预签名 URL
                // 对于临时上传，我们可以使用预签名 URL 的方式
                const presignedUrl = await minioClient.presignedPutObject(
                    BUCKET_NAME,
                    '${filename}', // 这里使用模板字符串，客户端上传时需要替换实际的文件名
                    3600 // 1小时有效期
                );

                return {
                    uploadUrl: presignedUrl,
                    endPoint: 'localhost:9001',
                    bucket: BUCKET_NAME
                }
            } catch (error) {
                console.error('获取上传凭证失败:', error);
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '获取上传凭证失败'
                })
            }
        }),
    // 创建文件记录
    createFile: protectedProcedure
        .input(fileInfoSchema)
        .mutation(async ({ input, ctx }) => {
            const file = await prisma.userFile.create({
                data: {
                    name: input.name,
                    size: input.size,
                    type: input.type,
                    path: input.path,
                    description: input.description,
                    ownerId: ctx.user.id
                }
            })
            return file
        }),

    // 获取文件列表
    listFiles: protectedProcedure
        .query(async ({ ctx }) => {
            const files = await prisma.userFile.findMany({
                where: {
                    ownerId: ctx.user.id
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
            return files
        }),

    // 获取文件下载地址
    getFileUrl: protectedProcedure
        .input(z.object({ path: z.string() }))
        .query(async ({ input }) => {
            try {
                const url = await minioClient.presignedGetObject(
                    BUCKET_NAME,
                    input.path,
                    60 * 60 // 1小时有效期
                )
                return { url }
            } catch (error) {
                throw new TRPCError({
                    code: 'INTERNAL_SERVER_ERROR',
                    message: '获取下载地址失败'
                })
            }
        }),

    // 删除文件
    deleteFile: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ input, ctx }) => {
            const file = await prisma.userFile.findUnique({
                where: { id: input.id }
            })

            if (!file) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: '文件不存在'
                })
            }

            if (file.ownerId !== ctx.user.id) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: '无权删除该文件'
                })
            }

            // 删除 Minio 中的文件
            try {
                await minioClient.removeObject(BUCKET_NAME, file.path)
            } catch (error) {
                console.error('删除 Minio 文件失败:', error)
            }

            // 删除数据库记录
            await prisma.userFile.delete({
                where: { id: input.id }
            })

            return { success: true }
        })
}) 