import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'
import { prisma } from '@/utils/prisma'
import { TRPCError } from '@trpc/server'
import { Client } from 'minio'
import { FileType } from '@prisma/client'
import { getTranslation } from '../i18n'

// Minio 客户端配置
const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT) : undefined,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'wsk779yxZAoghq5ExAwZ',
    secretKey: process.env.MINIO_SECRET_KEY || 'MLM2GXUuHenu08bL899pADzMNO7UZNAvl6Lo8ZCA'
})

const BUCKET_NAME = process.env.MINIO_BUCKET || 'comxyz'

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
        .input(z.object({ 
            _randomParam: z.number().optional(),
            _uniqueId: z.string().optional() 
        }).optional())
        .query(async ({ ctx }) => {
            // 确保每次调用都生成新的UUID
            const uuid = crypto.randomUUID();
            const pathName = `${ctx.user.id}/${uuid}`;

            // 获取用户存储使用情况和最大限制
            const [user, maxStorageConfig] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: ctx.user.id },
                    select: { storageUsed: true }
                }),
                prisma.siteConfig.findFirst({
                    where: { 
                        key: 'user.storage.max',
                        locale: 'common'
                    }
                })
            ]);

            if (!user) {
                // 获取翻译函数
                const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
                
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: t('errors.user.notFound', '用户不存在')
                });
            }

            // 获取最大存储限制
            const maxStorage = maxStorageConfig ? parseInt(maxStorageConfig.value) : 2147483648; // 默认2GB
            
            // 如果已超过限制，抛出错误
            if (Number(user.storageUsed) >= maxStorage) {
                // 获取翻译函数
                const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
                
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: t('errors.file.storageLimit', '您的存储空间已用完，请删除一些文件后再上传')
                });
            }

            try {
                const presignedUrl = await minioClient.presignedPutObject(
                    BUCKET_NAME,
                    pathName,
                    3600
                );

                return {
                    uploadUrl: presignedUrl,
                    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
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
            // 获取用户当前存储使用情况和限制
            const [user, maxStorageConfig] = await Promise.all([
                prisma.user.findUnique({
                    where: { id: ctx.user.id },
                    select: { storageUsed: true }
                }),
                prisma.siteConfig.findFirst({
                    where: { 
                        key: 'user.storage.max',
                        locale: 'common'
                    }
                })
            ]);

            if (!user) {
                // 获取翻译函数
                const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
                
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: t('errors.user.notFound', '用户不存在')
                });
            }

            // 获取最大存储限制
            const maxStorage = maxStorageConfig ? parseInt(maxStorageConfig.value) : 2147483648; // 默认2GB
            
            // 检查上传文件后是否会超出存储限制
            if (Number(user.storageUsed) + input.size > maxStorage) {
                // 获取翻译函数
                const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
                
                const remainingSpace = maxStorage - Number(user.storageUsed);
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: t('errors.file.exceededLimit', '文件太大，会超出您的存储空间限制') + ', ' + 
                             t('errors.file.remainingSpace', '剩余空间: {space} 字节').replace('{space}', remainingSpace.toString())
                });
            }

            // 使用事务同时创建文件记录和更新用户存储使用量
            return await prisma.$transaction(async (prisma) => {
                // 创建文件记录
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
                });

                // 更新用户存储使用量
                await prisma.user.update({
                    where: { id: ctx.user.id },
                    data: {
                        storageUsed: { increment: BigInt(input.size) }
                    }
                });

                return file;
            });
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
                where: { id: input.id },
                include: {
                    owner: true
                }
            })

            if (!file) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: '文件不存在'
                })
            }

            // 检查权限：文件所有者或管理员可以删除
            if (file.ownerId !== ctx.user.id && !ctx.user.isAdmin) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: '无权删除该文件'
                })
            }

            // 使用事务同时删除文件和更新存储使用量
            return await prisma.$transaction(async (prisma) => {
                try {
                    await minioClient.removeObject(BUCKET_NAME, file.path)
                } catch (error) {
                    console.error('删除 Minio 文件失败:', error)
                }
    
                // 删除文件记录
                await prisma.userFile.delete({
                    where: { id: input.id }
                })
    
                // 更新用户存储使用量
                await prisma.user.update({
                    where: { id: file.ownerId },
                    data: {
                        storageUsed: {
                            decrement: BigInt(file.size)
                        }
                    }
                })
    
                return { success: true }
            });
        }),
        
    // 重命名文件
    renameFile: protectedProcedure
        .input(z.object({ 
            id: z.number(),
            newName: z.string().min(1).max(255).refine(name => {
                // 文件名安全性验证，禁止包含一些特殊字符
                return !/[\/\\:*?"<>|]/.test(name);
            }, {
                message: "文件名不能包含以下字符: / \\ : * ? \" < > |"
            })
        }))
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

            // 检查权限：文件所有者或管理员可以重命名
            if (file.ownerId !== ctx.user.id && !ctx.user.isAdmin) {
                throw new TRPCError({
                    code: 'FORBIDDEN',
                    message: '无权重命名该文件'
                })
            }

            // 更新文件名
            const updatedFile = await prisma.userFile.update({
                where: { id: input.id },
                data: { name: input.newName }
            })

            return updatedFile
        })
})