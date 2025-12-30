# 下克上小助手

文字游戏辅助系统 - 用于管理游戏中的势力、领土、军团等数据。

## 本地运行

### 环境要求
- Node.js 18.0.0 或更高版本

### 安装步骤

```bash
# 1. 安装所有依赖
npm run install:all

# 2. 构建项目
npm run build

# 3. 启动服务器
npm run start:prod
```

### 访问应用
打开浏览器访问：http://localhost:3001

### 登录信息
- 管理员密码：111
- 玩家登录：选择势力名称

## 开发模式

```bash
# 同时启动前端和后端开发服务器
npm run dev
```

## 技术栈
- 前端：React + TypeScript + Vite
- 后端：Express + TypeScript
- 数据存储：JSON 文件
