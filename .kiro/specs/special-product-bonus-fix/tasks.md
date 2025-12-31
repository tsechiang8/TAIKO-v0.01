# Implementation Plan: 特产加成效果修复

## Overview

修复特产系统中石高加成系数和年产战马未生效的问题。实现分为三个阶段：计算引擎修改、年度结算修改、前端显示更新。

## Tasks

- [x] 1. 修改计算引擎添加特产加成计算
  - [x] 1.1 添加 calculateSpecialProductKokudakaBonus 函数
    - 在 `server/src/calculation/index.ts` 中添加新函数
    - 遍历领地的所有特产，累加 kokudakaBonus
    - 处理特产不存在的情况
    - _Requirements: 1.1, 1.4_

  - [x] 1.2 添加 calculateSpecialProductAnnualHorses 函数
    - 在 `server/src/calculation/index.ts` 中添加新函数
    - 遍历领地的所有特产，累加 annualHorses
    - 处理特产不存在的情况
    - _Requirements: 2.1, 2.4_

  - [x] 1.3 修改 calculateSurfaceKokudaka 函数
    - 添加 specialProductKokudakaBonus 参数
    - 修改公式：`领地石高 × (1 + bonusCoefficient + specialProductKokudakaBonus) + ...`
    - _Requirements: 1.2, 1.3_

  - [x] 1.4 修改 FactionCalculationResult 接口和 calculateFactionData 函数
    - 添加 specialProductKokudakaBonus 字段
    - 添加 specialProductAnnualHorses 字段
    - 调用新的计算函数并传递结果
    - _Requirements: 1.1, 2.1_

  - [ ]* 1.5 编写属性测试：特产石高加成系数累加正确性
    - **Property 1: 特产石高加成系数累加正确性**
    - **Validates: Requirements 1.1, 1.4**

  - [ ]* 1.6 编写属性测试：表面石高计算公式正确性
    - **Property 2: 表面石高计算公式正确性**
    - **Validates: Requirements 1.2, 1.3**

- [x] 2. 修改年度结算添加战马产出
  - [x] 2.1 修改 FactionSettlement 接口
    - 在 `server/src/services/game-progress.ts` 中添加字段
    - 添加 horsesGained、previousHorses、newHorses 字段
    - _Requirements: 2.3_

  - [x] 2.2 修改 advanceYear 函数添加战马产出逻辑
    - 计算每个势力的特产年产战马总和
    - 将战马添加到势力的 horses 库存
    - 在结算结果中记录战马变化
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [ ]* 2.3 编写属性测试：年度结算战马产出正确性
    - **Property 3: 年度结算战马产出正确性**
    - **Validates: Requirements 2.1, 2.2, 2.4**

- [x] 3. Checkpoint - 确保后端测试通过
  - 运行所有测试确保通过
  - 如有问题请询问用户

- [x] 4. 更新前端显示特产加成信息
  - [x] 4.1 更新 API 类型定义
    - 在 `client/src/types/index.ts` 中添加新字段
    - 更新 FactionDashboardData 接口
    - _Requirements: 3.1, 3.2_

  - [x] 4.2 更新势力数据服务返回特产加成字段
    - 修改 `server/src/services/faction.ts` 中的 getFactionDashboardData
    - 返回 specialProductKokudakaBonus 和相关计算值
    - _Requirements: 3.1, 3.2_

  - [x] 4.3 更新 Dashboard 组件显示特产加成
    - 在收支明细中显示特产石高加成系数
    - 显示特产带来的石高加成数值
    - _Requirements: 3.1, 3.2_

  - [x] 4.4 更新年度结算结果显示战马获得
    - 在 GameProgressControl 组件中显示战马产出
    - 更新 client/src/api/index.ts 中的 FactionSettlement 接口添加 horses 字段
    - _Requirements: 3.3_

- [x] 5. Final Checkpoint - 确保所有功能正常
  - 所有代码修改已完成
  - 如有问题请询问用户

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- 修改计算公式时需要确保向后兼容，不影响现有数据
- 特产数据已存在于系统中，只需要正确应用加成逻辑
- 前端显示更新是可选的，核心功能是后端计算正确
