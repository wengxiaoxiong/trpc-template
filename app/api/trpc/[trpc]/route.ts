import { appRouter } from '@/server';
import { Context } from '@/utils/trpc';
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';

const createContext = async ({ req }: { req: Request }): Promise<Context> => {
  const headers = Object.fromEntries(req.headers.entries());
  return {
    req: {
        headers: headers,
    }
  }
};

const handler = async (req: Request) => {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });
  if (response.status === 401) {
    // 重定向到登录页面
    window.location.href = "/login";
  }
  return response;
};

export { handler as GET, handler as POST };