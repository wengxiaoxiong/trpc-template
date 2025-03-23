# tRPC 全栈应用模板

这是一个基于 Next.js + tRPC + Prisma + Tailwind CSS 构建的现代化 Web 应用模板，提供完整的用户认证、文件管理和管理后台功能。

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

## 项目特点

- **高性能** - 使用 Next.js 和 React 构建，确保快速加载和响应式体验
- **安全可靠** - 内置完善的认证系统和权限控制，保护数据安全
- **可扩展架构** - 基于 tRPC 和 Prisma 的架构，方便扩展和维护
- **美观界面** - 结合 Ant Design 和 Tailwind CSS 打造现代化用户界面
- **完整的登录体系** - 包含登录、注册和权限管理
- **功能完备** - 完整的用户认证系统、API 类型安全、实时数据更新、后台管理系统

## 项目结构

```
├── app/                # Next.js 应用目录
├── server/             # tRPC 服务器代码
├── prisma/             # Prisma 配置和迁移
├── public/             # 静态资源
├── utils/              # 工具函数
└── docs/               # 文档
```

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

### 环境要求

- Node.js 18+
- pnpm (推荐) 或 npm/yarn
- MySQL 8.0+
- MinIO (可选)

### 安装步骤

1. 克隆项目
```bash
git clone https://github.com/wengxiaoxiong/trpc-template.git
cd trpc-template
```

2. 安装依赖
```bash
pnpm install
# 或者
npm install
# 或者
yarn install
```

3. 配置环境变量
```bash
cp .env.example .env
```
编辑 `.env` 文件，填入必要的环境变量。

```
DATABASE_URL="mysql://root:12345678@localhost:3306/mydb"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="your-secret-key"
```

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
# 或者
npm run dev
# 或者
yarn dev
```

访问地址：
- 前台页面：http://localhost:3002
- 后台管理：http://localhost:3002/admin

后台管理初始账号：
- 用户名：admin
- 密码：adminadmin

### 构建

构建生产版本：
```bash
pnpm build
# 或者
npm run build
# 或者
yarn build
```

启动生产服务器：
```bash
pnpm start
# 或者
npm run start
# 或者
yarn start
```

## 功能模块

### 邀请码系统

系统提供邀请码注册功能，可以限制用户注册，只有拥有有效邀请码的用户才能注册。

#### 管理邀请码

1. 管理员可以在后台创建邀请码
2. 每个邀请码可以设置有效期和使用次数
3. 系统会记录邀请码的使用记录

#### 生成邀请码

1. 登录管理后台 (/admin)
2. 进入"邀请码管理"页面
3. 点击"生成邀请码"按钮
4. 设置邀请码有效期和可使用次数
5. 点击"确认"生成邀请码

### 网站配置系统

系统支持动态配置网站的多种属性，管理员可以在后台进行配置管理，无需修改代码即可更新网站信息。

#### 配置功能

- **网站基本信息配置**：包括网站标题、描述、Logo等
- **页脚信息配置**：包括版权信息、页脚标语等
- **自定义配置项**：支持添加自定义配置项

#### 可配置字段

系统当前支持以下预定义配置字段：

| 配置键 | 说明 | 示例值 |
|-------|------|-------|
| site.title | 网站标题 | tRPC全栈应用 |
| site.description | 网站描述 | 基于Next.js和tRPC的高性能全栈应用 |
| site.footer.copyright | 页脚版权信息 | © 2024 Example Inc. |
| site.footer.slogan | 页脚标语 | 为开发者提供更好的全栈体验 |
| site.logo.url | Logo图片路径 | /images/logo.png |
| site.year | 版权年份 | 2024 |

#### 管理配置

1. 使用管理员账号登录系统
2. 进入管理后台 (/admin)
3. 在侧边栏找到"网站配置"选项
4. 在配置页面可以编辑现有配置或添加新的配置项
5. 修改后点击"保存"按钮使配置生效

#### 添加新配置项

1. 在网站配置页面点击"添加配置"按钮
2. 输入配置键（推荐使用点分隔的命名方式，如`site.new.config`）
3. 输入配置值
4. 添加配置描述（可选）
5. 点击"保存"按钮

#### 在前端使用配置

配置项可以在前端代码中通过自定义Hook获取：

```typescript
// 导入自定义Hook
import { useSiteConfig } from '@/hooks/useSiteConfig'

// 在组件中使用
const MyComponent = () => {
  // 获取配置工具函数
  const { getConfigValue } = useSiteConfig()
  
  // 获取特定配置，第二个参数为默认值
  const siteTitle = getConfigValue('site.title', '模版项目')
  const siteDesc = getConfigValue('site.description', '一个现代化的Web应用')
  const footerCopyright = getConfigValue('site.footer.copyright', '© 2024')
  
  return (
    <div>
      <h1>{siteTitle}</h1>
      <p>{siteDesc}</p>
      <footer>{footerCopyright}</footer>
    </div>
  )
}
```

该Hook提供了类型安全且便捷的方式来读取网站配置，无需重复编写API调用代码。

## 部署指南

### 标准部署

项目可以部署到任何支持 Next.js 的平台:

```bash
npm run build
npm run start
```

### Docker 部署

本项目支持使用 Docker 进行容器化部署，简化环境配置和应用部署过程。

#### 构建 Docker 镜像

```bash
docker build -t trpc-app .
```

#### 运行 Docker 容器

```bash
docker run -d \
  --name trpc-app \
  -p 3002:3002 \
  -e DATABASE_URL="mysql://user:password@host:3306/dbname" \
  -e MINIO_ACCESS_KEY="minio_access_key" \
  -e MINIO_SECRET_KEY="minio_secret_key" \
  -e MINIO_ENDPOINT="minio_endpoint" \
  -e MINIO_USE_SSL=false \
  -e MINIO_BUCKET="bucket_name" \
  -e JWT_SECRET="your_jwt_secret" \
  -e PORT=3002 \
  trpc-app
```

#### 环境变量说明

| 环境变量 | 说明 | 示例 |
|---------|------|------|
| DATABASE_URL | 数据库连接字符串 | mysql://user:password@host:3306/dbname |
| MINIO_ACCESS_KEY | MinIO 访问密钥 | minio_access_key |
| MINIO_SECRET_KEY | MinIO 秘密密钥 | minio_secret_key |
| MINIO_ENDPOINT | MinIO 服务端点 | minio.example.com |
| MINIO_USE_SSL | 是否使用 SSL 连接 MinIO | true/false |
| MINIO_BUCKET | MinIO 存储桶名称 | mybucket |
| JWT_SECRET | JWT 签名密钥 | your_secure_secret_key |
| PORT | 应用服务端口 | 3002 |

#### 使用 Docker Compose

创建 `docker-compose.yml` 文件：

```yaml
version: '3'
services:
  app:
    build: .
    ports:
      - "3002:3002"
    environment:
      - DATABASE_URL=mysql://user:password@db:3306/trpc_db
      - MINIO_ACCESS_KEY=minio_access_key
      - MINIO_SECRET_KEY=minio_secret_key
      - MINIO_ENDPOINT=minio:9000
      - MINIO_USE_SSL=false
      - MINIO_BUCKET=trpc-bucket
      - JWT_SECRET=your_jwt_secret
      - PORT=3002
    depends_on:
      - db
      - minio
  
  db:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=trpc_db
      - MYSQL_USER=user
      - MYSQL_PASSWORD=password
    volumes:
      - mysql_data:/var/lib/mysql
  
  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      - MINIO_ROOT_USER=minio_access_key
      - MINIO_ROOT_PASSWORD=minio_secret_key
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"

volumes:
  mysql_data:
  minio_data:
```

运行 Docker Compose：

```bash
docker-compose up -d
```

## 开发指南

### tRPC 后端开发指南

#### 基础依赖
```typescript
import { prisma } from '@/utils/prisma'  // 数据库操作
import { router, publicProcedure, protectedProcedure } from '@/utils/trpc'  // tRPC工具
import { z } from 'zod'  // 参数校验
```

#### 创建新的Router

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

#### 注册Router

在 `server/index.ts` 中注册新的路由:

```typescript
export const appRouter = router({
    existingRouter: existingRouter,
    newRouter: newRouter  // 添加新的路由
})
```

### tRPC 前端开发指南

#### 基础使用

直接从工具包引入 trpc 客户端:
```typescript
import { trpc } from '@/utils/trpc/client'
```

#### useQuery 使用规范

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

#### useMutation 使用规范

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

#### 数据刷新方式

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

### 开发示例

#### 创建任务示例

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

#### 获取列表示例

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

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT
