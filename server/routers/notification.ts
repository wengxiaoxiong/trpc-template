import { z } from 'zod';
import { protectedProcedure, publicProcedure, router, adminProcedure } from '@/utils/trpc';
import { prisma } from '@/utils/prisma';
import { TRPCError } from '@trpc/server';
import { getTranslation } from '../i18n';
import { NotificationStatus, NotificationType, Prisma } from '@prisma/client';

export const notificationRouter = router({
  // 获取当前用户的通知列表
  getUserNotifications: protectedProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(10),
        status: z.enum(['ALL', 'READ', 'UNREAD']).default('ALL'),
      })
    )
    .query(async ({ ctx, input }) => {
      const { skip, take, status } = input;
      const userId = ctx.user.id;

      // 构建过滤条件
      const statusFilter: Prisma.NotificationRecipientWhereInput = {};
      if (status === 'READ') {
        statusFilter.status = NotificationStatus.READ;
      } else if (status === 'UNREAD') {
        statusFilter.status = NotificationStatus.UNREAD;
      }

      // 获取通知总数
      const totalCount = await prisma.notificationRecipient.count({
        where: {
          userId,
          ...statusFilter,
        },
      });

      // 获取通知列表
      const notifications = await prisma.notificationRecipient.findMany({
        where: {
          userId,
          ...statusFilter,
        },
        include: {
          notification: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take,
      });

      return {
        notifications,
        totalCount,
      };
    }),

  // 标记通知为已读
  markAsRead: protectedProcedure
    .input(
      z.object({
        notificationId: z.number().optional(),
        all: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { notificationId, all } = input;
      const userId = ctx.user.id;
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;

      if (!notificationId && !all) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: t('errors.notification.missingParam', '缺少参数: 需要提供notificationId或all=true'),
        });
      }

      if (all) {
        // 标记所有通知为已读
        await prisma.notificationRecipient.updateMany({
          where: {
            userId,
            status: NotificationStatus.UNREAD,
          },
          data: {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
        });

        return { success: true };
      } else {
        // 标记单个通知为已读
        const notification = await prisma.notificationRecipient.findUnique({
          where: {
            notificationId_userId: {
              notificationId: notificationId!,
              userId,
            },
          },
        });

        if (!notification) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: t('errors.notification.notFound', '通知不存在'),
          });
        }

        await prisma.notificationRecipient.update({
          where: {
            notificationId_userId: {
              notificationId: notificationId!,
              userId,
            },
          },
          data: {
            status: NotificationStatus.READ,
            readAt: new Date(),
          },
        });

        return { success: true };
      }
    }),

  // 获取未读通知数量
  getUnreadCount: protectedProcedure
    .query(async ({ ctx }) => {
      const userId = ctx.user.id;

      const count = await prisma.notificationRecipient.count({
        where: {
          userId,
          status: NotificationStatus.UNREAD,
        },
      });

      return { count };
    }),

  // 创建系统通知（管理员功能）
  createNotification: adminProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
        type: z.enum([NotificationType.SYSTEM, NotificationType.USER]),
        isGlobal: z.boolean().default(false),
        userIds: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { title, content, type, isGlobal, userIds } = input;
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;

      // 创建通知
      const notification = await prisma.notification.create({
        data: {
          title,
          content,
          type,
          isGlobal,
        },
      });

      // 处理通知接收者
      if (isGlobal) {
        // 全站消息，发送给所有用户
        const users = await prisma.user.findMany({
          select: { id: true },
        });

        const recipients = users.map(user => ({
          notificationId: notification.id,
          userId: user.id,
        }));

        if (recipients.length > 0) {
          await prisma.notificationRecipient.createMany({
            data: recipients,
          });
        }
      } else if (userIds && userIds.length > 0) {
        // 发送给指定用户
        const recipients = userIds.map(userId => ({
          notificationId: notification.id,
          userId,
        }));

        await prisma.notificationRecipient.createMany({
          data: recipients,
        });
      } else {
        // 非全站消息但没有指定用户
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: t('errors.notification.missingUserIds', '非全站消息必须指定接收用户'),
        });
      }

      return {
        notification,
      };
    }),

  // 管理员获取所有通知列表
  getAllNotifications: adminProcedure
    .input(
      z.object({
        skip: z.number().default(0),
        take: z.number().default(10),
        type: z.enum(['ALL', 'SYSTEM', 'USER']).default('ALL'),
      })
    )
    .query(async ({ input }) => {
      const { skip, take, type } = input;

      // 构建过滤条件
      const typeFilter: Prisma.NotificationWhereInput = {};
      if (type === 'SYSTEM') {
        typeFilter.type = NotificationType.SYSTEM;
      } else if (type === 'USER') {
        typeFilter.type = NotificationType.USER;
      }

      // 获取通知总数
      const totalCount = await prisma.notification.count({
        where: typeFilter,
      });

      // 获取通知列表
      const notifications = await prisma.notification.findMany({
        where: typeFilter,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          _count: {
            select: {
              recipients: true,
            }
          }
        },
        skip,
        take,
      });

      return {
        notifications,
        totalCount,
      };
    }),

  // 删除通知（管理员功能）
  deleteNotification: adminProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { id } = input;
      const t = (ctx.t ?? getTranslation(ctx.locale || 'zh').t)!;

      const notification = await prisma.notification.findUnique({
        where: { id },
      });

      if (!notification) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: t('errors.notification.notFound', '通知不存在'),
        });
      }

      // 删除通知及其所有接收记录
      await prisma.notification.delete({
        where: { id },
      });

      return { success: true };
    }),
});

