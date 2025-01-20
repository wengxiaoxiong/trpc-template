import {
    type inferRouterInputs,
    type inferRouterOutputs,
} from '@trpc/server'
import { router } from '@/utils/trpc'
// import { batchTaskRouter } from './routers/task'
import { authRouter } from './routers/auth'
import { workflowRouter } from './routers/workflow'
import { minioRouter } from './routers/minio'
import { taskRouter } from './routers/task'
import { serverRouter } from './routers/server'

export const appRouter = router({
    // batchTask: batchTaskRouter,
    auth: authRouter,
    task: taskRouter,
    workflow: workflowRouter,
    minio: minioRouter,
    server: serverRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>