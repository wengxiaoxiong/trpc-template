import { initTRPC } from '@trpc/server';
import SuperJSON from 'superjson';
import { verifyToken } from '@/utils/jwt';


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
        throw new Error('Token missing from cookie');
    }
    const decoded = verifyToken(token);
    if (!decoded) {
        throw new Error('Invalid token');
    }
    return next({   
        ctx: {
            ...ctx,
            user: decoded,
        },
    });
});

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(isAuthenticated);
export const createCallerFactory = t.createCallerFactory;