# 全局导入导出功能 - 使用指南

## 功能概述

现在支持**完整的全局导入导出**功能，可以导入和导出整个游戏数据文件，包括所有郡国、势力、军团、武士、特产等数据。

## 新增功能

### 1. 全局导出
- 导出所有游戏数据为 JSON 文件
- 文件名格式：`exported-data-{ISO时间戳}.json`
- 包含完整的游戏状态和所有数据

### 2. 全局导入
- 导入完整的 JSON 数据文件
- 支持导入 `exported-data-*.json` 格式的文件
- 导入时覆盖所有现有数据
- 显示导入摘要（导入的数据数量）

## 使用方法

### 导出数据

1. 以管理员身份登录
2. 进入管理员面板
3. 点击"数据导出"选项卡
4. 点击"导出所有数据"按钮
5. 浏览器自动下载 JSON 文件

### 导入数据

1. 以管理员身份登录
2. 进入管理员面板
3. 点击"数据导出"选项卡（注意：导入按钮在这个选项卡中）
4. 点击"导入数据文件"按钮
5. 选择要导入的 JSON 文件
6. 等待导入完成，查看导入摘要

## 数据格式

### 导出/导入数据格式

```json
{
  "version": "1.0",
  "exportedAt": "2026-01-05T12:34:56.789Z",
  "data": {
    "gameState": {
      "currentYear": 1,
      "isLocked": true,
      "adminCode": "admin",
      "securityKey": "..."
    },
    "territories": [...],
    "factions": [...],
    "samurais": [...],
    "legions": [...],
    "specialProducts": [...]
  }
}
```

## 兼容性

✅ 完全兼容 `exported-data-2026-01-04T14-46-11.json` 格式

该文件可以直接导入系统，导出的文件也是相同格式。

## 实现细节

### 后端

- **全局导入服务** (`server/src/services/global-import.ts`)
  - 验证导入数据的完整性
  - 执行全局导入操作
  - 返回导入摘要

- **全局导入路由** (`server/src/routes/global-import.ts`)
  - `POST /api/global-import/data` 端点
  - 需要管理员认证

### 前端

- **导出导入组件** (`client/src/components/DataExportImport.tsx`)
  - 统一的导出导入界面
  - 导出和导入按钮并排显示
  - 文件选择对话框
  - 导入摘要显示

- **API 函数** (`client/src/api/index.ts`)
  - `exportAllData()` - 导出所有数据
  - `importGlobalData(jsonData)` - 导入数据

## 导入摘要

导入完成后会显示以下信息：

- 游戏状态：是否导入
- 郡国数据：导入数量
- 势力数据：导入数量
- 武士数据：导入数量
- 军团数据：导入数量
- 特产数据：导入数量

## 注意事项

⚠️ **重要提示**

1. 导入会**覆盖所有现有数据**，请谨慎操作
2. 建议在导入前先导出当前数据作为备份
3. 导入失败时不会修改任何数据
4. 导入需要管理员权限

## 错误处理

如果导入失败，会显示详细的错误信息：

- JSON 格式错误
- 缺少必要的数据字段
- 数据类型不匹配
- 其他导入错误

## 文件位置

### 新增文件

- `server/src/services/global-import.ts` - 全局导入服务
- `server/src/routes/global-import.ts` - 全局导入路由
- `client/src/components/DataExportImport.tsx` - 导出导入组件
- `client/src/components/DataExportImport.css` - 组件样式

### 修改文件

- `server/src/index.ts` - 注册全局导入路由
- `client/src/api/index.ts` - 添加导入 API 函数
- `client/src/components/AdminPanel.tsx` - 使用新组件
- `client/src/components/index.ts` - 导出新组件

## 编译状态

✅ 服务器编译成功
✅ 客户端编译成功
✅ 没有错误或警告

## 测试建议

1. 导出当前数据
2. 修改一些数据
3. 导入之前导出的数据
4. 验证数据是否恢复
5. 尝试导入 `exported-data-2026-01-04T14-46-11.json` 文件

