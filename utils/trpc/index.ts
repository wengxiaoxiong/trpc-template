import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';
import { verifyToken } from '@/utils/jwt';
import { TRPCError } from '@trpc/server';
import { prisma } from '../prisma';
import { createI18nMiddleware } from '@/server/i18n';

// 只定义需要的类型
export interface Context {
    req: {
      headers: {
        authorization?: string;
        cookie?: string;
        'accept-language'?: string;
        [key:string]:string|undefined;
      };
    };
    user?: any;
    locale?: string;
    t?: (key: string, defaultValue?: string) => string;
}

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON,
});

// 添加国际化中间件
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure.use(createI18nMiddleware());

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
    const token = ctx.req?.headers?.cookie?.split('; ').find(row => row.startsWith('token'))?.split('=')[1];
    if (!token) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: ctx.t ? ctx.t('auth.token_missing', 'Token missing from cookie') : 'Token missing from cookie' });
    }
    // user: { id: 1, iat: 1734955270, exp: 1734958870 }
    const decoded = verifyToken(token) as {id:number,iat: number,exp: number}
    if (!decoded) {
        throw new TRPCError({ code: 'FORBIDDEN', message: ctx.t ? ctx.t('auth.invalid_token', 'Invalid token') : 'Invalid token' });
    }
    // 判断是否过期
    if (decoded.exp < Date.now() / 1000) {
        throw new TRPCError({ code: 'FORBIDDEN', message: ctx.t ? ctx.t('auth.token_expired', 'Token expired') : 'Token expired' });
    }

    const user = await prisma.user.findFirst({where:{id:decoded.id}})
    if(user){
        return next({   
            ctx: {
                ...ctx,
                user: user,
            },
        });
    }else{
        throw new TRPCError({ code: 'FORBIDDEN', message: ctx.t ? ctx.t('auth.no_user', 'No user') : 'No user' });
    }
});

const isAdmin = t.middleware(async ({ ctx, next }) => {
    const token = ctx.req?.headers?.cookie?.split('; ').find(row => row.startsWith('token'))?.split('=')[1];
    if (!token) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: ctx.t ? ctx.t('auth.token_missing', 'Token missing from cookie') : 'Token missing from cookie' });
    }

    const decoded = verifyToken(token) as {id:number,iat: number,exp: number}
    if (!decoded || decoded.exp < Date.now() / 1000) {
        throw new TRPCError({ code: 'FORBIDDEN', message: ctx.t ? ctx.t('auth.invalid_expired_token', 'Invalid or expired token') : 'Invalid or expired token' });
    }

    const user = await prisma.user.findFirst({where:{id:decoded.id}})
    if (!user?.isAdmin) {
        throw new TRPCError({ code: 'FORBIDDEN', message: ctx.t ? ctx.t('auth.admin_required', '需要管理员权限') : '需要管理员权限' });
    }

    return next({
        ctx: {
            ...ctx,
            user: user,
        },
    });
});

// 更新导出的procedures，确保先应用i18n中间件
export const protectedProcedure = publicProcedure.use(isAuthenticated);
export const adminProcedure = publicProcedure.use(isAdmin);
export const createCallerFactory = t.createCallerFactory;