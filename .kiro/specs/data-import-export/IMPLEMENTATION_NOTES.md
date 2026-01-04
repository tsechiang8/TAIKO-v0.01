# 数据导入导出功能 - 实现说明

## 功能概述

本实现为下克上小助手添加了完整的数据导入导出功能，允许管理员：
1. **导出**所有游戏数据为 JSON 文件（用于备份）
2. **导入**之前导出的 JSON 文件来恢复游戏状态

## 实现内容

### 后端实现

#### 1. 导出服务 (`server/src/services/export.ts`)
- `exportAllData()` 函数：收集所有游戏数据并返回导出格式的对象
- 导出数据包括：
  - 游戏状态（年份、锁定状态、管理员代码）
  - 所有郡国数据
  - 所有势力数据
  - 所有武士数据
  - 所有军团数据
  - 所有特产配置
  - 初始数据
  - 操作记录

#### 2. 导出路由 (`server/src/routes/export.ts`)
- `POST /api/export/data` 端点
- 需要管理员认证
- 返回 JSON 格式的导出数据

#### 3. 路由注册 (`server/src/index.ts`)
- 在主服务器文件中注册导出路由
- 路由前缀：`/api/export`

### 前端实现

#### 1. 导出组件 (`client/src/components/DataExport.tsx`)
- 显示导出按钮和说明文字
- 调用导出 API
- 自动下载 JSON 文件
- 文件名格式：`exported-data-{ISO时间戳}.json`
- 显示导出状态和错误提示

#### 2. 导出样式 (`client/src/components/DataExport.css`)
- 美观的导出界面样式
- 加载动画
- 成功/错误提示样式

#### 3. 客户端 API (`client/src/api/index.ts`)
- `exportAllData()` 函数：调用导出 API
- 返回导出数据对象

#### 4. 管理员面板 (`client/src/components/AdminPanel.tsx`)
- 添加"数据导出"选项卡
- 集成导出组件

## 使用方法

### 导出数据

1. 以管理员身份登录
2. 进入管理员面板
3. 点击"数据导出"选项卡
4. 点击"导出所有数据"按钮
5. 浏览器会自动下载 JSON 文件

### 导入数据

1. 以管理员身份登录
2. 进入管理员面板
3. 点击"数据导入"选项卡
4. 选择导入类型（建议使用之前导出的完整数据）
5. 粘贴或上传数据
6. 点击"预览数据"查看导入内容
7. 点击"确认导入"执行导入

## 导出数据格式

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-05T12:34:56.789Z",
  "data": {
    "gameState": { ... },
    "territories": [ ... ],
    "factions": [ ... ],
    "samurais": [ ... ],
    "legions": [ ... ],
    "specialProducts": [ ... ],
    "initialData": { ... },
    "operationRecords": [ ... ]
  }
}
```

## 重要说明

### 不修改现有功能
- ✅ 所有现有功能保持不变
- ✅ 导入功能已存在，本实现只添加导出功能
- ✅ 没有删除或修改任何现有代码

### 数据完整性
- 导出包含所有游戏数据
- 导入时可以完全恢复游戏状态
- 支持导出-导入循环

### 安全性
- 导出和导入都需要管理员认证
- 导入时会覆盖现有数据，请谨慎操作

## 文件清单

### 新增文件
- `server/src/services/export.ts` - 导出服务
- `server/src/routes/export.ts` - 导出路由
- `client/src/components/DataExport.tsx` - 导出组件
- `client/src/components/DataExport.css` - 导出样式
- `.kiro/specs/data-import-export/design.md` - 设计文档
- `.kiro/specs/data-import-export/tasks.md` - 任务列表

### 修改文件
- `server/src/index.ts` - 添加导出路由注册
- `client/src/api/index.ts` - 添加导出 API 函数
- `client/src/components/AdminPanel.tsx` - 添加导出选项卡
- `client/src/components/index.ts` - 导出 DataExport 组件

## 编译和部署

### 编译
```bash
# 编译服务器
cd server && npm run build

# 编译客户端
cd client && npm run build
```

### 部署
- 将编译后的文件部署到服务器
- 服务器会自动提供导出和导入功能

## 测试

### 手动测试步骤
1. 启动服务器和客户端
2. 以管理员身份登录
3. 进入管理员面板
4. 点击"数据导出"导出数据
5. 验证下载的 JSON 文件格式
6. 点击"数据导入"导入导出的数据
7. 验证数据是否正确导入

### 验证导出数据
- 检查 JSON 文件是否有效
- 验证包含所有必要的数据字段
- 检查时间戳格式是否正确

## 故障排除

### 导出失败
- 检查是否以管理员身份登录
- 检查服务器是否正常运行
- 查看浏览器控制台的错误信息

### 导入失败
- 检查 JSON 文件格式是否正确
- 检查是否以管理员身份登录
- 查看导入错误提示

## 后续改进

可能的改进方向：
1. 支持增量导出（只导出变化的数据）
2. 支持数据压缩（减小文件大小）
3. 支持定时自动备份
4. 支持数据版本管理
5. 支持选择性导出（只导出特定类型的数据）

