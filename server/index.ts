import {
    type inferRouterInputs,
    type inferRouterOutputs,
} from '@trpc/server'
import { router } from '@/utils/trpc'
// import { batchTaskRouter } from './routers/task'
import { userRouter } from './routers/user'
import { minioRouter } from './routers/minio'
import { configRouter } from './routers/config'

export const appRouter = router({
    user: userRouter,
    minio: minioRouter,
    config: configRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>