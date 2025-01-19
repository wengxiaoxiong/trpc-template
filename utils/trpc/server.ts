import { appRouter } from '@/server';
import { Context, createCallerFactory } from '@/utils/trpc';
import type { NextApiRequest } from 'next';

const createContext = (req?: NextApiRequest): Context => {
  const headers = req?.headers || {};
  const formattedHeaders: Context['req']['headers'] = {};

  for (const key in headers) {
    if (typeof headers[key] === 'string') {
      formattedHeaders[key] = headers[key] as string;
    } else if (Array.isArray(headers[key])) {
      formattedHeaders[key] = (headers[key] as string[]).join(', ');
    }
  }

  return {
    req: {
      headers: formattedHeaders,
    },
  };
};

const createCaller = createCallerFactory(appRouter);

export const createServerCaller = (req: NextApiRequest) => {
  return createCaller(createContext(req));
};