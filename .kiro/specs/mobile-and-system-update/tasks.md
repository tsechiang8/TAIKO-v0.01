# Implementation Plan: Mobile and System Update

## Overview

本实现计划将系统更新分为6个主要模块：移动端适配、商业投资重构、投资确认机制、回溯系统、重置系统、管理员安全密钥。采用增量开发方式，每个模块完成后进行验证。

## Tasks

- [x] 1. 移动端表格适配
  - [x] 1.1 修改DataTable.css添加移动端滚动支持
    - 添加 overflow-x: auto 和 -webkit-overflow-scrolling: touch
    - 移除 text-overflow: ellipsis 和 overflow: hidden
    - 设置 white-space: nowrap 和 min-width
    - _Requirements: 1.1, 1.2, 1.3, 1.6_
  - [x] 1.2 修改DataTable组件确保表头固定
    - 调整表头position为sticky
    - 确保滚动时表头可见
    - _Requirements: 1.5_

- [x] 2. 投资数值调整
  - [x] 2.1 修改investment.ts中的投资配置
    - 农业baseCost: 5000 → 7000
    - 水军baseCost: 8000 → 9000
    - 武备baseCost: 4000 → 6000
    - _Requirements: 4.1, 4.2, 4.3_

- [x] 3. 商业投资系统重构
  - [x] 3.1 修改后端商业投资服务
    - 新增calculateCommerceSuccessRate函数
    - 修改executeCommerceInvestment处理四种结果分支
    - 添加大成功退款逻辑
    - _Requirements: 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14_
  - [x] 3.2 编写商业投资成功率属性测试

    - **Property 1: 商业投资成功率边界约束**
    - **Validates: Requirements 2.6**
  - [ ]* 3.3 编写商业投资结果分支属性测试
    - **Property 4: 商业投资结果分支完整性**
    - **Validates: Requirements 2.11, 2.12, 2.13, 2.14**
  - [x] 3.4 修改前端InvestmentPanel组件
    - 添加郡国选择器（仅商业投资时显示）
    - 修改商业投资预览显示
    - 更新结果消息显示
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_
  - [x] 3.5 添加商业投资API端点
    - 新增获取势力领地列表API
    - 修改投资预览API支持郡国参数
    - 修改投资执行API支持郡国参数
    - _Requirements: 2.1_

- [x] 4. 投资确认机制完善
  - [x] 4.1 确保四种投资都有确认对话框
    - 检查现有确认对话框实现
    - 统一确认对话框显示内容
    - _Requirements: 3.1, 3.2, 3.6_
  - [x] 4.2 完善结果对话框显示具体数值
    - 农业/水军/武备显示点数增长
    - 商业显示特产开发结果或失败原因
    - _Requirements: 3.3, 3.4, 3.5_
  - [ ]* 4.3 编写投资确认机制一致性测试
    - **Property 6: 四种投资确认机制一致性**
    - **Validates: Requirements 3.6**

- [x] 5. Checkpoint - 投资系统验证
  - 确保所有投资功能正常工作
  - 验证移动端显示正常
  - 如有问题请告知

- [x] 6. 回溯系统实现
  - [x] 6.1 修改后端回溯服务
    - 实现rollbackToOperation函数的数据恢复
    - 添加回溯后清理后续操作记录和快照的逻辑
    - _Requirements: 5.3, 5.4_
  - [ ]* 6.2 编写回溯数据一致性属性测试
    - **Property 7: 回溯数据一致性**
    - **Validates: Requirements 5.3**
  - [x] 6.3 修改前端GameProgressControl组件
    - 完善回溯确认对话框
    - 添加二次确认机制
    - _Requirements: 5.1, 5.2, 5.5_

- [x] 7. 重置系统实现
  - [x] 7.1 创建初始数据存储服务
    - 新增initial-territories.json文件
    - 实现saveAsInitialData函数
    - 实现getInitialData函数
    - 实现updateInitialData函数
    - _Requirements: 2.5.1, 2.5.6_
  - [x] 7.2 实现重置功能后端
    - 实现executeReset函数
    - 清空势力、军团、操作记录
    - 从初始数据恢复郡国
    - 重置游戏状态
    - _Requirements: 6.3, 6.4_
  - [ ]* 7.3 编写重置数据一致性属性测试
    - **Property 9: 重置数据一致性**
    - **Validates: Requirements 6.3, 6.4**
  - [x] 7.4 创建前端初始数据管理界面
    - 在AdminPanel添加初始数据管理标签
    - 显示初始郡国数据列表
    - 支持修改初始石高和特产
    - _Requirements: 2.5.2, 2.5.3, 2.5.4, 2.5.5_
  - [x] 7.5 创建前端重置功能界面
    - 在GameProgressControl添加重置按钮
    - 实现确认文本输入对话框
    - 显示重置成功提示
    - _Requirements: 6.1, 6.2, 6.5_

- [x] 8. 管理员安全密钥
  - [x] 8.1 扩展GameState数据结构
    - 添加securityKey字段
    - 实现generateSecurityKey函数
    - 首次启动时自动生成安全密钥
    - _Requirements: 8.2, 8.3_
  - [ ]* 8.2 编写安全密钥格式属性测试
    - **Property 10: 安全密钥格式验证**
    - **Validates: Requirements 8.3**
  - [x] 8.3 修改认证服务支持双重登录
    - 修改login函数支持安全密钥验证
    - _Requirements: 8.4_
  - [ ]* 8.4 编写双重认证属性测试
    - **Property 11: 双重认证支持**
    - **Validates: Requirements 8.4**
  - [x] 8.5 添加管理员代码修改功能
    - 新增修改管理员代码API
    - 在AdminPanel添加修改界面
    - _Requirements: 8.1, 8.5_
  - [x] 8.6 在管理员界面显示安全密钥
    - 在GameProgressControl或AdminPanel显示当前安全密钥
    - 添加复制按钮
    - _Requirements: 8.6_

- [x] 9. 年度石高增长验证
  - [x] 9.1 检查现有增长率计算实现
    - 审查advanceYear函数中的石高增长逻辑
    - 确认计算公式正确
    - _Requirements: 7.1, 7.2, 7.3_
  - [x] 9.2 编写年度石高增长属性测试

    - **Property 12: 年度石高增长计算**
    - **Validates: Requirements 7.1, 7.2**

- [x] 10. Final Checkpoint - 全面验证
  - 确保所有功能正常工作
  - 验证移动端显示
  - 测试回溯和重置功能
  - 验证管理员登录
  - 如有问题请告知

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- 建议按顺序执行任务，确保依赖关系正确
