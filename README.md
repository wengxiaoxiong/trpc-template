# 现代化 Web 应用模版

这是一个基于 Next.js + tRPC + Prisma + Tailwind CSS 构建的现代化 Web 应用模版，提供完整的用户认证、文件管理和管理后台功能。

## 项目特点

- **高性能** - 使用 Next.js 和 React 构建，确保快速加载和响应式体验
- **安全可靠** - 内置完善的认证系统和权限控制，保护数据安全
- **可扩展架构** - 基于 tRPC 和 Prisma 的架构，方便扩展和维护
- **美观界面** - 结合 Ant Design 和 Tailwind CSS 打造现代化用户界面
- **完整的登录体系** - 包含登录、注册和权限管理

## 系统架构

本项目采用了最新的前端技术栈:

- **Next.js** - React 框架，提供服务端渲染和静态生成
- **tRPC** - 端到端类型安全的 API 层
- **Prisma** - 下一代 ORM，简化数据库操作
- **Tailwind CSS** - 实用优先的 CSS 框架
- **Ant Design** - 企业级 UI 组件库

## 路由结构

系统采用了分层的路由结构:

- **/** - Landing Page，产品介绍页面，未登录用户可访问，已登录用户也可查看并有引导进入系统的按钮
- **/login** - 用户登录页面
- **/register** - 用户注册页面
- **/webapp** - 应用主页，需要登录才能访问，包含系统主要功能
- **/files** - 文件管理页面，需要登录才能访问
- **/admin** - 管理后台，需要管理员权限

## 用户体验

- **未登录用户** - 可以访问产品介绍页面、登录和注册页面
- **已登录用户** - 可以在产品介绍页面看到自己的登录状态，并通过"进入系统"按钮直接进入应用
- **系统内部** - 登录后可以使用所有功能，并通过顶部导航在各功能间切换

## 开始使用

### 安装依赖

```bash
npm install
# 或者
yarn install
```

### 配置环境变量

复制 `.env.example` 文件为 `.env.local` 并填写相应配置:

```
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

### 运行开发服务器

```bash
npm run dev
# 或者
yarn dev
```

访问 http://localhost:3000 查看应用。

## 部署

项目可以部署到任何支持 Next.js 的平台:

```bash
npm run build
npm run start
```

## 用户指南

### 未登录用户

访问网站首页可以查看产品信息，通过顶部导航可以进行登录或注册。未登录用户可以访问:

- 首页产品介绍
- 登录页面
- 注册页面

### 已登录用户

登录成功后可以访问系统的所有功能:

- 应用主页 (/webapp)
- 文件管理 (/files)
- 个人设置
- 对于管理员用户，可以访问管理后台 (/admin)

## 贡献指南

欢迎提交 Pull Request 或提出 Issue。

## 许可证

MIT

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
- 👨‍💼 后台管理系统

## 开始使用

### 环境要求

- Node.js 18+
- pnpm
- MySQL 8.0+
- MinIO (可选)

### 安装

1. 克隆项目
```bash
git clone https://github.com/wengxiaoxiong/trpc-template.git
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

5. 创建初始管理员账号
```sql
INSERT INTO `User` (`id`, `createdAt`, `updatedAt`, `username`, `password`, `avatar`, `isAdmin`) VALUES
(1, '2025-03-23 02:14:04.236', '2025-03-23 02:14:04.236', 'admin', '$2b$10$aaO94E2iiaDYKksaDZbPp./bKXU7n.1A2iT3LZrs1y2PPDSS15lHq', NULL, 1);
```

### 开发

启动开发服务器：
```bash
pnpm dev
```

访问地址：
- 前台页面：http://localhost:3000
- 后台管理：http://localhost:3000/admin

后台管理初始账号：
- 用户名：admin
- 密码：adminadmin

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
