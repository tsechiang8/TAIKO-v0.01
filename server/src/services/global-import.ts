/**
 * 全局数据导入服务
 * 支持导入完整的游戏数据文件
 */

import {
  saveFactions,
  saveTerritories,
  saveSamurais,
  saveLegions,
  saveSpecialProducts,
  saveGameState,
} from '../storage';
import { GameState, Territory, FactionData, Samurai, Legion, SpecialProduct } from '../types';

/**
 * 全局导入数据格式
 */
export interface GlobalImportData {
  version: string;
  exportedAt: string;
  data: {
    gameState: GameState;
    territories: Territory[];
    factions: FactionData[];
    samurais: Samurai[];
    legions: Legion[];
    specialProducts: SpecialProduct[];
    initialData?: unknown;
    operationRecords?: unknown;
  };
}

/**
 * 验证导入数据的完整性
 */
function validateImportData(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    errors.push('导入数据必须是有效的 JSON 对象');
    return { valid: false, errors };
  }

  const importData = data as Record<string, unknown>;

  // 检查版本
  if (!importData.version) {
    errors.push('缺少版本号 (version)');
  }

  // 检查数据对象
  if (!importData.data || typeof importData.data !== 'object') {
    errors.push('缺少数据对象 (data)');
    return { valid: false, errors };
  }

  const gameData = importData.data as Record<string, unknown>;

  // 检查必要的数据字段
  if (!gameData.gameState || typeof gameData.gameState !== 'object') {
    errors.push('缺少游戏状态数据 (gameState)');
  }

  if (!Array.isArray(gameData.territories)) {
    errors.push('缺少郡国数据 (territories)，必须是数组');
  }

  if (!Array.isArray(gameData.factions)) {
    errors.push('缺少势力数据 (factions)，必须是数组');
  }

  if (!Array.isArray(gameData.samurais)) {
    errors.push('缺少武士数据 (samurais)，必须是数组');
  }

  if (!Array.isArray(gameData.legions)) {
    errors.push('缺少军团数据 (legions)，必须是数组');
  }

  if (!Array.isArray(gameData.specialProducts)) {
    errors.push('缺少特产数据 (specialProducts)，必须是数组');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * 执行全局导入
 */
export function importGlobalData(jsonText: string): {
  success: boolean;
  message: string;
  summary?: {
    gameState: boolean;
    territories: number;
    factions: number;
    samurais: number;
    legions: number;
    specialProducts: number;
  };
  errors: string[];
} {
  try {
    // 解析 JSON
    let importData: unknown;
    try {
      importData = JSON.parse(jsonText);
    } catch (e) {
      return {
        success: false,
        message: 'JSON 格式错误',
        errors: [`JSON 解析失败: ${e instanceof Error ? e.message : '未知错误'}`],
      };
    }

    // 验证数据
    const validation = validateImportData(importData);
    if (!validation.valid) {
      return {
        success: false,
        message: '导入数据验证失败',
        errors: validation.errors,
      };
    }

    const data = importData as GlobalImportData;

    try {
      // 导入游戏状态
      const gameState = data.data.gameState as GameState;
      saveGameState(gameState);

      // 导入郡国数据
      const territories = (data.data.territories || []) as Territory[];
      saveTerritories(territories);

      // 导入势力数据
      const factions = (data.data.factions || []) as FactionData[];
      saveFactions(factions);

      // 导入武士数据
      const samurais = (data.data.samurais || []) as Samurai[];
      saveSamurais(samurais);

      // 导入军团数据
      const legions = (data.data.legions || []) as Legion[];
      saveLegions(legions);

      // 导入特产数据
      const specialProducts = (data.data.specialProducts || []) as SpecialProduct[];
      saveSpecialProducts(specialProducts);

      return {
        success: true,
        message: '全局数据导入成功',
        summary: {
          gameState: true,
          territories: territories.length,
          factions: factions.length,
          samurais: samurais.length,
          legions: legions.length,
          specialProducts: specialProducts.length,
        },
        errors: [],
      };
    } catch (error) {
      return {
        success: false,
        message: '导入过程中出错',
        errors: [error instanceof Error ? error.message : '未知错误'],
      };
    }
  } catch (error) {
    return {
      success: false,
      message: '导入失败',
      errors: [error instanceof Error ? error.message : '未知错误'],
    };
  }
}
