import {
    type inferRouterInputs,
    type inferRouterOutputs,
} from '@trpc/server'
import { router } from '@/utils/trpc'
import { batchTaskRouter } from './routers/task'
import { authRouter } from './routers/auth'
import { workflowRouter } from './routers/workflow'

export const appRouter = router({
    batchTask: batchTaskRouter,
    auth: authRouter,
    workflow:workflowRouter
})

// export type definition of API
export type AppRouter = typeof appRouter

export type RouterOutputs = inferRouterOutputs<AppRouter>
export type RouterInputs = inferRouterInputs<AppRouter>