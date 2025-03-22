# tRPC 全栈应用模板

这是一个基于 Next.js 和 tRPC 的全栈应用模板，集成了现代化的前端框架和强大的后端功能。

## 技术栈

### 前端
- Next.js 14
- React 18
- TypeScript
- TailwindCSS
- Ant Design
- tRPC Client
- React Query
- Recoil (状态管理)

### 后端
- tRPC Server
- Prisma (ORM)
- MySQL (数据库)
- Redis (缓存)
- MinIO (对象存储)
- JWT (认证)

## 功能特性

- 🔐 完整的用户认证系统
- 🌐 API 类型安全 (tRPC)
- 🔄 实时数据更新

## 开始使用

### 环境要求

- Node.js 18+
- pnpm
- MinIO (可选)

### 安装

1. 克隆项目
```bash
git clone [项目地址]
cd trpc_template
```

2. 安装依赖
```bash
pnpm install
```

3. 配置环境变量
```bash
cp .env.example .env
```
编辑 `.env` 文件，填入必要的环境变量。

4. 初始化数据库
```bash
pnpm prisma generate
pnpm prisma db push
```

### 开发

启动开发服务器：
```bash
pnpm dev
```

### 构建

构建生产版本：
```bash
pnpm build
```

启动生产服务器：
```bash
pnpm start
```

## 项目结构

```
├── app/                # Next.js 应用目录
├── server/            # tRPC 服务器代码
├── prisma/            # Prisma 配置和迁移
├── public/            # 静态资源
├── utils/             # 工具函数
└── docs/              # 文档
```

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT

# tRPC 开发指南

## 1. 后端开发指南

### 1.1 基础依赖
```typescript
import { prisma } from '@/utils/prisma'  // 数据库操作
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'  // tRPC工具
import { z } from 'zod'  // 参数校验
```

### 1.2 创建新的Router

在 `server/routers/` 目录下创建新的路由文件,基本结构如下:

```typescript
export const newRouter = router({
    // 公开接口
    publicEndpoint: publicProcedure
        .input(z.object({
            // 使用zod定义入参类型
            param1: z.string(),
            param2: z.number()
        }))
        .query(async ({ctx, input}) => {
            // 使用prisma进行数据库操作
            const result = await prisma.someModel.findMany({
                where: {
                    field: input.param1
                }
            })
            return result
        }),

    // 需要认证的接口    
    protectedEndpoint: protectedProcedure
        .input(z.object({
            // 入参定义
        }))
        .mutation(async ({ctx, input}) => {
            // ctx.user 可以获取当前登录用户信息
            const result = await prisma.someModel.create({
                data: {
                    ...input,
                    userId: ctx.user.id
                }
            })
            return result
        })
})
```

### 1.3 注册Router

在 `server/index.ts` 中注册新的路由:

```typescript
export const appRouter = router({
    existingRouter: existingRouter,
    newRouter: newRouter  // 添加新的路由
})
```

## 2. 前端开发指南

### 2.1 基础使用

直接从工具包引入 trpc 客户端:
```typescript
import { trpc } from '@/utils/trpc/client'
```

### 2.2 useQuery 使用规范

用于获取数据的查询接口:

```typescript
// 基础查询
const { data, isLoading } = trpc.workflow.list.useQuery();

// 带参数的查询
const { data: task } = trpc.task.getById.useQuery(taskId);

// 带配置的查询
const { data, refetch } = trpc.auth.getCurrentUser.useQuery(undefined, {
    retry: false,                 // 失败是否重试
    refetchOnWindowFocus: false,  // 窗口聚焦是否重新请求
    refetchOnMount: true          // 组件挂载时是否重新请求
});
```

### 2.3 useMutation 使用规范

用于修改数据的变更接口:

```typescript
// 基础用法
const { mutateAsync: createTask } = trpc.task.create.useMutation();

// 带回调的用法
const { mutateAsync: login } = trpc.auth.login.useMutation({
    onSuccess: (data) => {
        message.success('操作成功');
        // 其他成功处理
    },
    onError: (error) => {
        message.error(error.message);
        // 其他错误处理
    }
});

// 调用方式
try {
    await mutateAsync({
        param1: 'value1',
        param2: 'value2'
    });
} catch (error) {
    console.error('操作失败:', error);
}
```

### 2.4 数据刷新方式

```typescript
// 1. 使用 refetch 刷新单个查询
const { data, refetch } = trpc.someApi.useQuery();
await refetch();

// 2. 使用 utils 刷新指定查询
const utils = trpc.useUtils();
utils.someApi.someQuery.invalidate();

// 3. 在mutation成功后刷新
const mutation = trpc.someApi.create.useMutation({
    onSuccess: () => {
        // 刷新相关查询
        utils.someApi.list.invalidate();
    }
});
```

## 3. 开发示例

### 3.1 创建任务示例

```typescript
// 后端路由定义 (server/routers/task.ts)
export const taskRouter = router({
    create: protectedProcedure
        .input(z.object({
            name: z.string(),
            workflowId: z.number()
        }))
        .mutation(async ({ctx, input}) => {
            return prisma.task.create({
                data: {
                    name: input.name,
                    workflowId: input.workflowId,
                    ownerId: ctx.user.id,
                    status: 'PENDING'
                }
            })
        })
});

// 前端使用 (app/components/CreateTask.tsx)
const CreateTask = () => {
    const utils = trpc.useUtils();
    const createTask = trpc.task.create.useMutation({
        onSuccess: () => {
            message.success('任务创建成功');
            utils.task.list.invalidate();  // 刷新任务列表
        }
    });

    const handleCreate = async () => {
        try {
            await createTask.mutateAsync({
                name: 'New Task',
                workflowId: 1
            });
        } catch (error) {
            message.error('创建失败');
        }
    };
};
```

### 3.2 获取列表示例

```typescript
// 后端路由定义 (server/routers/task.ts)
export const taskRouter = router({
    list: protectedProcedure
        .query(async ({ctx}) => {
            return prisma.task.findMany({
                where: {
                    ownerId: ctx.user.id
                },
                orderBy: {
                    createdAt: 'desc'
                }
            })
        })
});

// 前端使用 (app/components/TaskList.tsx)
const TaskList = () => {
    const { data: tasks, isLoading } = trpc.task.list.useQuery();

    if (isLoading) return <div>加载中...</div>;

    return (
        <div>
            {tasks?.map(task => (
                <div key={task.id}>{task.name}</div>
            ))}
        </div>
    );
};
``` 