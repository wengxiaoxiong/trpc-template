import { z } from 'zod';
import { protectedProcedure, publicProcedure, router, adminProcedure } from '@/utils/trpc';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcryptjs';
import { generateToken } from '@/utils/jwt';
import { TRPCError } from '@trpc/server';
import { getTranslation } from '../i18n';

export const userRouter = router({
  // 认证相关
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
        invitationCode: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { username, password, invitationCode } = input;
      // 使用非空断言确保TypeScript知道t函数一定存在
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
      
      // 检查是否需要邀请码
      const requireInvitationCode = await prisma.siteConfig.findFirst({
        where: { 
          key: 'registration.requireInvitationCode',
          locale: 'common'
        },
      });
      
      if (requireInvitationCode && requireInvitationCode.value === 'true' && !invitationCode) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: t('errors.invitationCode.required', '注册需要邀请码'),
        });
      }

      let invitationCodeRecord;
      if (invitationCode) {
        invitationCodeRecord = await prisma.invitationCode.findUnique({
          where: { code: invitationCode },
        });

        if (!invitationCodeRecord) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: t('errors.invitationCode.invalid', '邀请码无效'),
          });
        }

        if (!invitationCodeRecord.isActive) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: t('errors.invitationCode.disabled', '邀请码已被禁用'),
          });
        }

        if (invitationCodeRecord.expiresAt && invitationCodeRecord.expiresAt < new Date()) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: t('errors.invitationCode.expired', '邀请码已过期'),
          });
        }

        if (invitationCodeRecord.usedCount >= invitationCodeRecord.maxUses) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: t('errors.invitationCode.maxUsesReached', '邀请码已达到最大使用次数'),
          });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          ...(invitationCodeRecord ? { invitationCodeId: invitationCodeRecord.id } : {}),
        },
      });

      // 更新邀请码使用次数
      if (invitationCodeRecord) {
        await prisma.invitationCode.update({
          where: { id: invitationCodeRecord.id },
          data: { usedCount: invitationCodeRecord.usedCount + 1 },
        });
      }

      const token = generateToken(user.id);
      const sanitizedUser = { ...user, password: undefined };
      return { token, user: sanitizedUser };
    }),

  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { username, password } = input;
      // 使用非空断言确保TypeScript知道t函数一定存在
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
      
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new Error(t('errors.user.notFound', '用户不存在'));
      }
      if (!user.password) {
        throw new Error(t('errors.auth.noPassword', '用户没有设置密码'));
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error(t('errors.auth.invalidCredentials', '用户名或密码错误'));
      }
      const token = generateToken(user.id);
      const sanitizedUser = { ...user, password: undefined };
      return { token, user: sanitizedUser };
    }),

  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      // 使用非空断言确保TypeScript知道t函数一定存在
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
      
      const user = await prisma.user.findUnique({
        where: { id: ctx.user.id },
        select: {
          id: true,
          username: true,
          avatar: true,
          isAdmin: true,
          storageUsed: true,
        }
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: t('errors.user.notFound', '用户不存在'),
        });
      }

      return {
        ...user,
        storageUsed: Number(user.storageUsed)
      };
    }),

  updateAvatar: protectedProcedure
    .input(
      z.object({
        avatarPath: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // 获取翻译函数
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
      
      if (!ctx.user.id) {
        throw new Error(t('errors.common.unauthorized', '未授权操作'));
      }

      const updatedUser = await prisma.user.update({
        where: { id: ctx.user.id },
        data: { avatar: input.avatarPath },
      });

      const sanitizedUser = { ...updatedUser, password: undefined };
      return sanitizedUser;
    }),

  // 管理员相关
  getUsers: adminProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
      search: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const { page, pageSize, search } = input;
      const skip = (page - 1) * pageSize;

      const where = search ? {
        OR: [
          { username: { contains: search } },
        ],
      } : {};

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            files: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return {
        users,
        total,
        page,
        pageSize,
      };
    }),

  createUser: adminProcedure
    .input(z.object({
      username: z.string(),
      password: z.string().min(6),
      email: z.string().email().optional(),
      isAdmin: z.boolean().default(false),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // 获取翻译函数
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
      
      try {
        // 检查用户名是否已存在
        const existingUser = await prisma.user.findUnique({
          where: { username: input.username }
        });

        if (existingUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: t('errors.user.alreadyExists', '用户名已存在')
          });
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);
        return prisma.user.create({
          data: {
            ...input,
            password: hashedPassword,
          },
        });
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: t('errors.common.internalError', '内部服务器错误') + ': ' + (error instanceof Error ? error.message : '未知错误')
        });
      }
    }),

  updateUser: adminProcedure
    .input(z.object({
      id: z.number(),
      username: z.string().optional(),
      email: z.string().email().optional(),
      isAdmin: z.boolean().optional(),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.user.update({
        where: { id },
        data,
      });
    }),

  deleteUser: adminProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      return prisma.user.delete({
        where: { id: input.id },
      });
    }),

  getUserFiles: adminProcedure
    .input(z.object({
      userId: z.number(),
      page: z.number().min(1).default(1),
      pageSize: z.number().min(1).max(100).default(10),
    }))
    .query(async ({ input }) => {
      const { userId, page, pageSize } = input;
      const skip = (page - 1) * pageSize;

      const [files, total] = await Promise.all([
        prisma.userFile.findMany({
          where: { ownerId: userId },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
        }),
        prisma.userFile.count({ where: { ownerId: userId } }),
      ]);

      return {
        files,
        total,
        page,
        pageSize,
      };
    }),

  // 获取用户总数
  getTotalUsers: protectedProcedure
    .query(async () => {
      const total = await prisma.user.count();
      return total;
    }),

  // 获取所有用户存储空间使用总量
  getTotalStorageUsed: adminProcedure
    .query(async () => {
      const users = await prisma.user.findMany({
        select: {
          storageUsed: true
        }
      });
      
      // 计算总的存储使用量
      const totalStorageUsed = users.reduce(
        (total, user) => total + Number(user.storageUsed), 
        0
      );
      
      return totalStorageUsed;
    }),

  // 邀请码管理
  createInvitationCode: adminProcedure
    .input(z.object({
      maxUses: z.number().min(1).default(1),
      expiresAt: z.string().optional().nullable(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { maxUses, expiresAt } = input;
      
      // 生成随机邀请码
      const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      };
      
      // 确保生成的邀请码唯一
      let code;
      let existingCode;
      do {
        code = generateRandomCode();
        existingCode = await prisma.invitationCode.findUnique({
          where: { code },
        });
      } while (existingCode);
      
      return prisma.invitationCode.create({
        data: {
          code,
          maxUses,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
          createdBy: ctx.user.id,
        },
      });
    }),
    
  getAllInvitationCodes: adminProcedure
    .query(async () => {
      return prisma.invitationCode.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          users: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });
    }),
    
  updateInvitationCode: adminProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean().optional(),
      maxUses: z.number().min(1).optional(),
      expiresAt: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return prisma.invitationCode.update({
        where: { id },
        data: {
          ...data,
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
        },
      });
    }),
    
  deleteInvitationCode: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return prisma.invitationCode.delete({
        where: { id: input.id },
      });
    }),

  // 获取注册是否需要邀请码
  getRequireInvitationCodeSetting: publicProcedure
    .query(async () => {
      const config = await prisma.siteConfig.findFirst({
        where: { 
          key: 'registration.requireInvitationCode',
          locale: 'common'
        },
      });
      return config?.value === 'true';
    }),

  // 通过ID获取用户信息
  getUserById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      // 获取翻译函数
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;
      
      const user = await prisma.user.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          username: true,
          avatar: true,
          isAdmin: true,
          storageUsed: true,
        }
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: t('errors.user.notFound', '用户不存在'),
        });
      }

      return {
        ...user,
        storageUsed: Number(user.storageUsed)
      };
    }),

  // 获取所有用户（管理员用）
  getAllUsers: adminProcedure
    .query(async () => {
      return await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          isAdmin: true,
          avatar: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }),
}); 