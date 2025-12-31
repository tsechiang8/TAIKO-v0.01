# Requirements Document

## Introduction

修复特产系统的加成效果未生效问题。当前系统中，特产的石高加成（kokudakaBonus）和年产战马（annualHorses）功能未正确实现，导致占领拥有特产的郡国时，势力无法获得应有的加成效果。

## Glossary

- **Special_Product**: 特产，郡国可拥有的特殊资源，提供各种加成效果
- **Kokudaka_Bonus**: 石高加成系数，特产提供的百分比石高加成（如2%表示0.02）
- **Annual_Horses**: 年产战马，特产每年为势力提供的战马数量
- **Annual_Kokudaka**: 年产石高，特产提供的固定石高加成
- **Soldier_Capacity_Bonus**: 兵力加成，特产提供的可招募士兵上限加成
- **Surface_Kokudaka**: 表面石高，势力的综合石高计算结果
- **Year_End_Settlement**: 年度结算，每年执行的收入、维护费、资源增长计算

## Requirements

### Requirement 1: 特产石高加成系数生效

**User Story:** As a 势力玩家, I want 特产的石高加成系数正确应用到表面石高计算中, so that 占领拥有高价值特产的郡国能获得相应的石高加成。

#### Acceptance Criteria

1. WHEN 计算势力表面石高时, THE Calculation_Engine SHALL 将所有特产的kokudakaBonus累加为总加成系数
2. WHEN 应用特产石高加成时, THE Calculation_Engine SHALL 将总加成系数乘以领地基础石高
3. THE Surface_Kokudaka SHALL 等于：领地石高 × (1 + 士兵维持比加成系数 + 特产石高加成系数) + 特产年产石高 + 领内财产 + 产业石高
4. WHEN 势力拥有多个带有kokudakaBonus的特产时, THE Calculation_Engine SHALL 累加所有特产的加成系数

### Requirement 2: 特产年产战马生效

**User Story:** As a 势力玩家, I want 特产的年产战马在每年结算时自动添加到势力库存, so that 占领产马地区能持续获得战马资源。

#### Acceptance Criteria

1. WHEN 执行年度结算时, THE Year_End_Settlement SHALL 计算势力所有领地特产的年产战马总和
2. WHEN 特产年产战马大于0时, THE Year_End_Settlement SHALL 将战马数量添加到势力的horses库存中
3. THE Year_End_Settlement SHALL 在结算结果中显示每个势力获得的战马数量
4. WHEN 势力拥有多个产马特产时, THE Year_End_Settlement SHALL 累加所有特产的年产战马

### Requirement 3: 前端显示特产加成效果

**User Story:** As a 势力玩家, I want 在仪表盘中看到特产带来的各项加成明细, so that 我能了解特产对势力的贡献。

#### Acceptance Criteria

1. WHEN 显示势力数据时, THE Dashboard SHALL 显示特产石高加成系数的总和
2. WHEN 显示势力数据时, THE Dashboard SHALL 显示特产带来的石高加成数值
3. WHEN 年度结算完成时, THE Settlement_Result SHALL 显示获得的战马数量

### Requirement 4: 计算结果正确性

**User Story:** As a 管理员, I want 确保特产加成计算正确无误, so that 游戏数值平衡不受影响。

#### Acceptance Criteria

1. THE Calculation_Engine SHALL 正确处理没有特产的郡国（加成为0）
2. THE Calculation_Engine SHALL 正确处理特产kokudakaBonus为0的情况
3. THE Calculation_Engine SHALL 正确处理特产annualHorses为0的情况
4. WHEN 特产数据不存在时, THE Calculation_Engine SHALL 使用默认值0进行计算
