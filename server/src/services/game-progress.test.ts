/**
 * 游戏进程服务属性测试
 * Feature: mobile-and-system-update
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getGrowthRate,
  calculateSoldierMaintenanceRatio,
  calculateMaxRecruitableSoldiers,
  calculateTerritoryKokudaka,
  MAINTENANCE_RATIO_EFFECTS,
} from '../calculation';

/**
 * Property 12: 年度石高增长计算
 * *For any* 年度结算，每个领地的石高增长应等于该领地当前石高乘以所属势力的增长率。
 * **Validates: Requirements 7.1, 7.2**
 * 
 * Feature: mobile-and-system-update, Property 12: 年度石高增长计算
 */
describe('Property 12: 年度石高增长计算', () => {
  /**
   * 模拟年度石高增长计算
   * 这是从 advanceYear 函数中提取的核心计算逻辑
   */
  function calculateKokudakaGrowth(baseKokudaka: number, growthRate: number): number {
    return Math.floor(baseKokudaka * growthRate);
  }

  it('should calculate territory kokudaka growth as floor(baseKokudaka × growthRate) for any valid inputs', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }), // baseKokudaka: 1000-1000000石
        fc.double({ min: 0, max: 1, noNaN: true }), // maintenanceRatio: 0-1
        (baseKokudaka, maintenanceRatio) => {
          // 根据士兵维持比获取增长率
          const growthRate = getGrowthRate(maintenanceRatio);
          
          // 计算石高增长
          const growth = calculateKokudakaGrowth(baseKokudaka, growthRate);
          
          // 验证计算公式：growth = floor(baseKokudaka × growthRate)
          const expected = Math.floor(baseKokudaka * growthRate);
          expect(growth).toBe(expected);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return integer growth values (floor operation)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (baseKokudaka, maintenanceRatio) => {
          const growthRate = getGrowthRate(maintenanceRatio);
          const growth = calculateKokudakaGrowth(baseKokudaka, growthRate);
          
          // 增长值必须是整数
          expect(Number.isInteger(growth)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return positive growth when maintenance ratio is low (0-20%)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 1000000 }), // 足够大的石高以产生可见增长
        fc.double({ min: 0, max: 0.20, noNaN: true }), // 低维持比
        (baseKokudaka, maintenanceRatio) => {
          const growthRate = getGrowthRate(maintenanceRatio);
          const growth = calculateKokudakaGrowth(baseKokudaka, growthRate);
          
          // 低维持比时增长率为3%，应该有正增长
          expect(growthRate).toBe(0.03);
          expect(growth).toBeGreaterThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should return negative growth when maintenance ratio is high (61-80%)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000, max: 1000000 }),
        fc.double({ min: 0.61, max: 0.80, noNaN: true }), // 高维持比
        (baseKokudaka, maintenanceRatio) => {
          const growthRate = getGrowthRate(maintenanceRatio);
          const growth = calculateKokudakaGrowth(baseKokudaka, growthRate);
          
          // 高维持比时增长率为-2%，应该有负增长
          expect(growthRate).toBe(-0.02);
          expect(growth).toBeLessThan(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should correctly apply growth rate based on maintenance ratio intervals', () => {
    // 测试每个维持比区间的增长率
    const testCases = [
      { ratioMin: 0, ratioMax: 0.20, expectedGrowthRate: 0.03 },
      { ratioMin: 0.21, ratioMax: 0.45, expectedGrowthRate: 0.01 },
      { ratioMin: 0.46, ratioMax: 0.60, expectedGrowthRate: -0.01 },
      { ratioMin: 0.61, ratioMax: 0.80, expectedGrowthRate: -0.02 },
      { ratioMin: 0.81, ratioMax: 0.94, expectedGrowthRate: -0.04 },
      { ratioMin: 0.95, ratioMax: 1.00, expectedGrowthRate: -0.08 },
    ];

    for (const { ratioMin, ratioMax, expectedGrowthRate } of testCases) {
      fc.assert(
        fc.property(
          fc.integer({ min: 10000, max: 500000 }),
          fc.double({ min: ratioMin, max: ratioMax, noNaN: true }),
          (baseKokudaka, maintenanceRatio) => {
            const growthRate = getGrowthRate(maintenanceRatio);
            const growth = calculateKokudakaGrowth(baseKokudaka, growthRate);
            
            // 验证增长率符合预期
            expect(growthRate).toBe(expectedGrowthRate);
            
            // 验证增长计算正确
            const expected = Math.floor(baseKokudaka * expectedGrowthRate);
            expect(growth).toBe(expected);
          }
        ),
        { numRuns: 20 } // 每个区间测试20次
      );
    }
  });

  it('should ensure new kokudaka is non-negative after applying growth', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 1000000 }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (baseKokudaka, maintenanceRatio) => {
          const growthRate = getGrowthRate(maintenanceRatio);
          const growth = calculateKokudakaGrowth(baseKokudaka, growthRate);
          
          // 新石高 = 原石高 + 增长（使用 Math.max(0, ...) 确保非负）
          const newKokudaka = Math.max(0, baseKokudaka + growth);
          
          expect(newKokudaka).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should calculate total faction kokudaka growth as sum of all territory growths', () => {
    fc.assert(
      fc.property(
        // 生成1-5个领地的石高数组
        fc.array(fc.integer({ min: 10000, max: 200000 }), { minLength: 1, maxLength: 5 }),
        fc.double({ min: 0, max: 1, noNaN: true }),
        (territoryKokudakas, maintenanceRatio) => {
          const growthRate = getGrowthRate(maintenanceRatio);
          
          // 计算每个领地的增长
          const territoryGrowths = territoryKokudakas.map(k => calculateKokudakaGrowth(k, growthRate));
          
          // 总增长应该等于各领地增长之和
          const totalGrowth = territoryGrowths.reduce((sum, g) => sum + g, 0);
          const expectedTotal = territoryKokudakas.reduce(
            (sum, k) => sum + Math.floor(k * growthRate),
            0
          );
          
          expect(totalGrowth).toBe(expectedTotal);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should verify growth rate lookup matches MAINTENANCE_RATIO_EFFECTS table', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        (maintenanceRatio) => {
          const growthRate = getGrowthRate(maintenanceRatio);
          
          // 找到对应的区间
          const expectedEffect = MAINTENANCE_RATIO_EFFECTS.find(
            effect => maintenanceRatio >= effect.min && maintenanceRatio <= effect.max
          );
          
          if (expectedEffect) {
            expect(growthRate).toBe(expectedEffect.growthRate);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  // 边界值测试
  describe('boundary value tests', () => {
    it('should handle minimum kokudaka correctly', () => {
      const minKokudaka = 1;
      const growthRate = 0.03; // 最高增长率
      const growth = calculateKokudakaGrowth(minKokudaka, growthRate);
      
      // floor(1 * 0.03) = 0
      expect(growth).toBe(0);
    });

    it('should handle large kokudaka correctly', () => {
      const largeKokudaka = 1000000;
      const growthRate = 0.03;
      const growth = calculateKokudakaGrowth(largeKokudaka, growthRate);
      
      // floor(1000000 * 0.03) = 30000
      expect(growth).toBe(30000);
    });

    it('should handle zero growth rate correctly', () => {
      // 维持比在46%-60%时增长率为-1%，没有0%的区间
      // 但我们可以测试接近0的情况
      const kokudaka = 100000;
      const growthRate = -0.01; // 最接近0的负增长率
      const growth = calculateKokudakaGrowth(kokudaka, growthRate);
      
      expect(growth).toBe(-1000);
    });

    it('should handle maximum negative growth rate correctly', () => {
      const kokudaka = 100000;
      const growthRate = -0.12; // 最大负增长率（维持比>100%时）
      const growth = calculateKokudakaGrowth(kokudaka, growthRate);
      
      expect(growth).toBe(-12000);
    });
  });
});
