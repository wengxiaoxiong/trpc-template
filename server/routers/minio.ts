import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { Client } from 'minio'
import { FileType } from '@prisma/client'

// Minio 客户端配置
const minioClient = new Client({
    endPoint: 'localhost',
    port: 9000,
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
    description: z.string().optional(),
    fileType: z.enum([FileType.AI_GENERATED_IMAGE, FileType.USER_UPLOADED_FILE, FileType.PARAMETER_IMAGE]).default(FileType.USER_UPLOADED_FILE)
})

// 修改分页参数 Schema，添加fileType过滤条件
const paginationSchema = z.object({
    page: z.number().default(1),
    pageSize: z.number().default(10),
    fileType: z.enum([FileType.AI_GENERATED_IMAGE, FileType.USER_UPLOADED_FILE, FileType.PARAMETER_IMAGE]).optional()
})



export const minioRouter = router({
    // 获取临时凭证
    getCredentials: protectedProcedure
        .query(async ({ ctx }) => {
            const pathName = `${ctx.user.id}/${crypto.randomUUID()}`

            try {
                const presignedUrl = await minioClient.presignedPutObject(
                    BUCKET_NAME,
                    pathName,
                    3600
                );

                return {
                    uploadUrl: presignedUrl,
                    endPoint: 'localhost:9000',
                    bucket: BUCKET_NAME,
                    pathName: pathName,
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
                    fileType: input.fileType,
                    path: input.path,
                    description: input.description,
                    ownerId: ctx.user.id
                }
            })
            return file
        }),

    // 获取文件列表（带分页和下载地址）
    listFiles: protectedProcedure
        .input(paginationSchema)
        .query(async ({ input, ctx }) => {
            const { page, pageSize, fileType } = input
            const skip = (page - 1) * pageSize

            // 构建查询条件
            const whereCondition = {
                ownerId: ctx.user.id,
                ...(fileType ? { fileType } : {})
            }

            const [files, total] = await Promise.all([
                prisma.userFile.findMany({
                    where: whereCondition,
                    orderBy: {
                        createdAt: 'desc'
                    },
                    skip,
                    take: pageSize
                }),
                prisma.userFile.count({
                    where: whereCondition
                })
            ])

            // 为每个文件生成下载地址
            const filesWithUrl = await Promise.all(files.map(async (file) => {
                try {
                    const url = await minioClient.presignedGetObject(
                        BUCKET_NAME,
                        file.path,
                        60 * 60 // 1小时有效期
                    )
                    return {
                        ...file,
                        url
                    }
                } catch (error) {
                    console.error('生成下载地址失败:', error)
                    return {
                        ...file,
                        url: null
                    }
                }
            }))

            return {
                files: filesWithUrl,
                total,
                page,
                pageSize
            }
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
        // 获取文件数量
    countFiles: protectedProcedure
        .query(async ({ ctx }) => {
            const count = await prisma.userFile.count({
                where: {
                    ownerId: ctx.user.id
                }
            })
            return count
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

            try {
                await minioClient.removeObject(BUCKET_NAME, file.path)
            } catch (error) {
                console.error('删除 Minio 文件失败:', error)
            }

            await prisma.userFile.delete({
                where: { id: input.id }
            })

            return { success: true }
        })
})