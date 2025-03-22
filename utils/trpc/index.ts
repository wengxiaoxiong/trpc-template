import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';
import { verifyToken } from '@/utils/jwt';
import { TRPCError } from '@trpc/server';
import { prisma } from '../prisma';

// 只定义需要的类型
export interface Context {
    req: {
      headers: {
        authorization?: string;
        cookie?: string;
        [key:string]:string|undefined;
      };
    };
}

const t = initTRPC.context<Context>().create({
    transformer: SuperJSON,
});

const isAuthenticated = t.middleware(async ({ ctx, next }) => {
    const token = ctx.req?.headers?.cookie?.split('; ').find(row => row.startsWith('token'))?.split('=')[1];
    if (!token) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Token missing from cookie' });
    }
    // user: { id: 1, iat: 1734955270, exp: 1734958870 }
    const decoded = verifyToken(token) as {id:number,iat: number,exp: number}
    if (!decoded) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid token' });
    }
    // 判断是否过期
    if (decoded.exp < Date.now() / 1000) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Token expired' });
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
        throw new TRPCError({ code: 'FORBIDDEN', message: 'No user' });
    }

});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const createCallerFactory = t.createCallerFactory;