import { appRouter } from '@/server';
import { Context, createCallerFactory } from '@/utils/trpc';
import type { NextApiRequest } from 'next';

const createContext = (req?: NextApiRequest): Context => {
  const headers = req?.headers || {};
  const formattedHeaders: Context['req']['headers'] = {};

  for (const key in headers) {
    if (typeof headers[key] === 'string') {
      formattedHeaders[key] = headers[key];
    }
    // you can add another if for header with array type if you need it
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