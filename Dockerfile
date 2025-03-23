# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 安装pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml
COPY package*.json ./
COPY pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile
RUN pnpm add -D autoprefixer tailwindcss postcss

# 复制源代码
COPY . .

# 生成 Prisma 客户端
RUN npx prisma generate

# 构建应用
RUN pnpm build

# 生产阶段
FROM node:20-alpine AS runner

WORKDIR /app

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3002

# 复制必要的文件
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# 暴露端口
EXPOSE 3002

# 启动命令
CMD ["node", "server.js"] 