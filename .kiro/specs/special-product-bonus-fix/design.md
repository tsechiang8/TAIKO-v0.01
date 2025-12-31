# Design Document: 特产加成效果修复

## Overview

本设计文档描述如何修复特产系统中未生效的加成功能。主要涉及两个核心问题：
1. 特产石高加成系数（kokudakaBonus）未应用到表面石高计算
2. 特产年产战马（annualHorses）未在年度结算时添加到势力库存

## Architecture

修改涉及以下模块：
- `server/src/calculation/index.ts` - 核心计算引擎，添加特产石高加成系数计算
- `server/src/services/game-progress.ts` - 年度结算服务，添加战马产出逻辑
- `server/src/services/faction.ts` - 势力数据服务，返回特产加成明细

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Dashboard)                     │
│  显示：特产石高加成系数、特产石高加成值、年产战马           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (Routes)                        │
│  /api/factions/me - 返回势力数据含特产加成明细              │
│  /api/game/advance-year - 返回结算结果含战马产出            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  game-progress.ts - advanceYear() 添加战马产出逻辑          │
│  faction.ts - getFactionDashboardData() 添加特产加成字段    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Calculation Engine                           │
│  calculation/index.ts:                                       │
│  - calculateSpecialProductKokudakaBonus() 新增              │
│  - calculateSpecialProductAnnualHorses() 新增               │
│  - calculateSurfaceKokudaka() 修改公式                      │
│  - calculateFactionData() 返回新字段                        │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. 新增计算函数

```typescript
// server/src/calculation/index.ts

/**
 * 计算特产石高加成系数总和
 * @param territories 势力拥有的所有领地
 * @param specialProducts 特产配置表
 * @returns 石高加成系数总和（如0.02表示2%）
 */
export function calculateSpecialProductKokudakaBonus(
  territories: Territory[],
  specialProducts: SpecialProduct[]
): number;

/**
 * 计算特产年产战马总和
 * @param territories 势力拥有的所有领地
 * @param specialProducts 特产配置表
 * @returns 年产战马总数
 */
export function calculateSpecialProductAnnualHorses(
  territories: Territory[],
  specialProducts: SpecialProduct[]
): number;
```

### 2. 修改表面石高计算公式

当前公式：
```
表面石高 = 领地石高 × (1 + 士兵维持比加成系数) + 特产年产石高 + 领内财产 + 产业石高
```

修改后公式：
```
表面石高 = 领地石高 × (1 + 士兵维持比加成系数 + 特产石高加成系数) + 特产年产石高 + 领内财产 + 产业石高
```

### 3. 修改 calculateSurfaceKokudaka 函数签名

```typescript
export function calculateSurfaceKokudaka(params: {
  territoryKokudaka: number;
  bonusCoefficient: number;           // 士兵维持比加成系数
  specialProductKokudakaBonus: number; // 新增：特产石高加成系数
  specialProductKokudaka: number;      // 特产年产石高
  integrationBonus: number;
  industryKokudaka: number;
}): number;
```

### 4. 修改 FactionCalculationResult 接口

```typescript
export interface FactionCalculationResult {
  // 现有字段...
  territoryKokudaka: number;
  specialProductKokudaka: number;
  specialProductKokudakaBonus: number;  // 新增：特产石高加成系数
  specialProductAnnualHorses: number;   // 新增：特产年产战马
  integrationBonus: number;
  bonusCoefficient: number;
  // ...其他字段
}
```

### 5. 修改年度结算结果接口

```typescript
export interface FactionSettlement {
  // 现有字段...
  factionId: string;
  factionName: string;
  income: number;
  maintenanceCost: number;
  previousTreasury: number;
  newTreasury: number;
  horsesGained: number;           // 新增：获得的战马数量
  previousHorses: number;         // 新增：结算前战马数量
  newHorses: number;              // 新增：结算后战马数量
  // ...其他字段
}
```

## Data Models

### SpecialProduct（现有，无需修改）

```typescript
interface SpecialProduct {
  name: string;
  annualKokudaka: number;      // 年产石高（固定值）
  annualHorses: number;        // 年产战马
  soldierCapacityBonus: number; // 兵力上限加成
  kokudakaBonus: number;       // 石高加成系数（如0.02表示2%）
  otherEffects: string;        // 其他效果描述
}
```

### Territory（现有，无需修改）

```typescript
interface Territory {
  // ...
  specialProduct1?: string;
  specialProduct2?: string;
  specialProduct3?: string;
  // ...
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: 特产石高加成系数累加正确性

*For any* 势力拥有的领地集合和特产配置表，计算得到的特产石高加成系数总和应等于所有领地所有特产的kokudakaBonus之和。

**Validates: Requirements 1.1, 1.4**

### Property 2: 表面石高计算公式正确性

*For any* 有效的计算输入参数，表面石高应等于：
`领地石高 × (1 + 士兵维持比加成系数 + 特产石高加成系数) + 特产年产石高 + 领内财产 + 产业石高`

**Validates: Requirements 1.2, 1.3**

### Property 3: 年度结算战马产出正确性

*For any* 势力和其拥有的领地，年度结算后势力的战马库存应增加所有领地特产的annualHorses之和。

**Validates: Requirements 2.1, 2.2, 2.4**

### Property 4: 结算结果包含战马信息

*For any* 年度结算操作，返回的结算结果中每个势力的horsesGained应等于该势力所有领地特产的annualHorses之和。

**Validates: Requirements 2.3**

## Error Handling

1. **特产不存在**：当领地引用的特产名称在特产表中不存在时，该特产的所有加成视为0
2. **空值处理**：特产的kokudakaBonus或annualHorses为undefined/null时，视为0
3. **无领地势力**：势力没有领地时，所有特产加成为0
4. **负值防护**：计算结果不应产生负的石高加成或负的战马数量

## Testing Strategy

### 单元测试

1. `calculateSpecialProductKokudakaBonus` 函数测试
   - 无特产领地返回0
   - 单个特产正确计算
   - 多个特产累加正确

2. `calculateSpecialProductAnnualHorses` 函数测试
   - 无特产领地返回0
   - 单个产马特产正确计算
   - 多个产马特产累加正确

3. `calculateSurfaceKokudaka` 函数测试
   - 新公式正确应用特产石高加成系数

4. `advanceYear` 函数测试
   - 战马正确添加到势力库存
   - 结算结果包含战马信息

### 属性测试

使用 vitest 和 fast-check 进行属性测试：

1. **Property 1**: 特产石高加成系数累加正确性
2. **Property 2**: 表面石高计算公式正确性
3. **Property 3**: 年度结算战马产出正确性
4. **Property 4**: 结算结果包含战马信息

每个属性测试运行至少100次迭代，使用随机生成的领地、特产和势力数据。
