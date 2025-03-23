import { z } from 'zod';
import { protectedProcedure, publicProcedure, router, adminProcedure } from '@/utils/trpc';
import { prisma } from '@/utils/prisma';
import bcrypt from 'bcrypt';
import { generateToken } from '@/utils/jwt';
import { TRPCError } from '@trpc/server';

export const userRouter = router({
  // 认证相关
  register: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { username, password } = input;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
        },
      });
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
    .mutation(async ({ input }) => {
      const { username, password } = input;
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        throw new Error('User not found');
      }
      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new Error('Invalid password');
      }
      const token = generateToken(user.id);
      const sanitizedUser = { ...user, password: undefined };
      return { token, user: sanitizedUser };
    }),

  getCurrentUser: protectedProcedure
    .query(async ({ ctx }) => {
      if (!ctx.user.id) {
        throw new Error('Unauthorized');
      }
      const userId = ctx.user?.id;
      if (!userId) {
        throw new Error('Not authenticated');
      }
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }
      const sanitizedUser = { ...user, password: undefined };
      return sanitizedUser;
    }),

  updateAvatar: protectedProcedure
    .input(
      z.object({
        avatarPath: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.id) {
        throw new Error('Unauthorized');
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
      isAdmin: z.boolean().default(false),
      avatar: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        // 检查用户名是否已存在
        const existingUser = await prisma.user.findUnique({
          where: { username: input.username }
        });

        if (existingUser) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: '用户名已存在'
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
          message: '创建用户失败：' + (error instanceof Error ? error.message : '未知错误')
        });
      }
    }),

  updateUser: adminProcedure
    .input(z.object({
      id: z.number(),
      username: z.string().optional(),
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
}); 