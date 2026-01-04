# 数据导入导出功能 - 设计文档

## 概述

本设计文档描述了数据导入导出功能的实现方案。该功能允许管理员导出所有游戏数据为 JSON 文件，也可以从 JSON 文件导入数据恢复游戏状态。

## 架构

### 导出功能架构

```
管理员界面 (AdminPanel)
    ↓
导出按钮 (DataExport 组件)
    ↓
导出 API (/api/export/data)
    ↓
存储层 (storage/index.ts)
    ↓
JSON 文件下载
```

### 导入功能架构（已存在）

```
管理员界面 (AdminPanel)
    ↓
导入组件 (DataImport 组件)
    ↓
导入 API (/api/import/*)
    ↓
存储层 (storage/index.ts)
    ↓
数据覆盖
```

## 组件和接口

### 1. 导出 API 端点

**POST /api/export/data**
- 认证要求：管理员
- 功能：导出所有游戏数据
- 返回格式：JSON 对象
- 包含内容：
  - 版本号
  - 导出时间戳
  - 游戏状态
  - 所有郡国数据
  - 所有势力数据
  - 所有军团数据
  - 所有武士数据
  - 所有特产配置
  - 初始数据
  - 操作记录
  - 记账日志

### 2. 导出服务 (server/src/services/export.ts)

**exportAllData()**
- 从存储层读取所有数据
- 组织成导出格式
- 返回导出数据对象

### 3. 导出路由 (server/src/routes/export.ts)

**POST /api/export/data**
- 调用导出服务
- 返回 JSON 数据

### 4. 客户端导出组件 (client/src/components/DataExport.tsx)

**DataExport 组件**
- 显示导出按钮
- 调用导出 API
- 处理文件下载
- 显示导出状态

### 5. 客户端 API (client/src/api/index.ts)

**exportAllData()**
- 调用导出 API
- 返回导出数据

## 数据模型

### 导出数据格式

```typescript
interface ExportData {
  version: string;                    // 版本号，如 "1.0"
  exportedAt: string;                 // ISO 8601 时间戳
  data: {
    gameState: GameState;
    territories: Territory[];
    factions: FactionData[];
    samurais: Samurai[];
    legions: Legion[];
    specialProducts: SpecialProduct[];
    initialData: InitialData | null;
    operationRecords: OperationRecord[];
    accountingLogs: AccountingLog[];
  };
}
```

## 错误处理

- 导出失败时返回 500 错误
- 客户端显示错误提示
- 不修改任何数据

## 测试策略

### 单元测试
- 测试导出服务能否正确读取所有数据
- 测试导出数据格式是否正确
- 测试导出 API 的认证和授权

### 集成测试
- 测试导出后的数据能否被导入
- 测试导出-导入循环的数据完整性
- 测试导出文件的下载功能

## 实现步骤

1. 创建导出服务 (server/src/services/export.ts)
2. 创建导出路由 (server/src/routes/export.ts)
3. 在主服务器文件中注册导出路由
4. 创建导出组件 (client/src/components/DataExport.tsx)
5. 在管理员面板中添加导出选项卡
6. 在客户端 API 中添加导出函数
7. 测试导出-导入循环

