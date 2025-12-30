# 使用 Node.js 18 作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制所有 package.json 和 package-lock.json 文件
COPY package.json package-lock.json ./
COPY server/package.json server/package-lock.json ./server/
COPY client/package.json client/package-lock.json ./client/

# 安装根目录依赖
RUN npm ci

# 安装 server 依赖（包括 devDependencies 用于构建）
WORKDIR /app/server
RUN npm ci

# 安装 client 依赖（包括 devDependencies 用于构建）
WORKDIR /app/client
RUN npm ci

# 回到根目录
WORKDIR /app

# 复制所有源代码
COPY . .

# 构建 server
WORKDIR /app/server
RUN npm run build

# 构建 client
WORKDIR /app/client
RUN npm run build

# 回到根目录
WORKDIR /app

# 设置生产环境
ENV NODE_ENV=production

# 暴露端口
EXPOSE 3001

# 启动服务
CMD ["node", "server/dist/index.js"]
