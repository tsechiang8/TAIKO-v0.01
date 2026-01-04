# 数据导入导出功能 - 实现任务

## 概述

本任务列表描述了实现数据导入导出功能的具体步骤。重点是添加导出功能，导入功能已经存在。

## 任务

- [x] 1. 创建导出服务
  - 在 `server/src/services/export.ts` 中创建导出服务
  - 实现 `exportAllData()` 函数，收集所有游戏数据
  - 返回符合导出格式的数据对象
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. 创建导出路由
  - 在 `server/src/routes/export.ts` 中创建导出路由
  - 实现 `POST /api/export/data` 端点
  - 添加管理员认证检查
  - 调用导出服务并返回 JSON 数据
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 3. 在主服务器文件中注册导出路由
  - 在 `server/src/index.ts` 中导入导出路由
  - 注册 `/api/export` 路由
  - _Requirements: 1.1_

- [x] 4. 创建客户端导出组件
  - 在 `client/src/components/DataExport.tsx` 中创建导出组件
  - 显示导出按钮
  - 调用导出 API
  - 处理文件下载（JSON 格式）
  - 显示导出状态和错误提示
  - _Requirements: 3.1, 3.2_

- [x] 5. 在客户端 API 中添加导出函数
  - 在 `client/src/api/index.ts` 中添加 `exportAllData()` 函数
  - 调用 `/api/export/data` 端点
  - 返回导出数据
  - _Requirements: 1.1, 1.2_

- [x] 6. 在管理员面板中添加导出选项卡
  - 在 `client/src/components/AdminPanel.tsx` 中添加导出选项卡
  - 导入 `DataExport` 组件
  - 在选项卡列表中添加导出选项
  - 在内容区域中渲染导出组件
  - _Requirements: 3.1, 3.2, 3.3_

- [ ] 7. 测试导出-导入循环
  - 导出数据
  - 验证导出文件格式
  - 导入导出的数据
  - 验证数据完整性
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2_

