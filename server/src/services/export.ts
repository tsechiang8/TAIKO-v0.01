/**
 * 数据导出服务
 * Requirements: 1.1-1.4
 */

import {
  getGameState,
  getTerritories,
  getFactions,
  getSamurais,
  getLegions,
  getSpecialProducts,
  getInitialData,
  getOperationRecords,
} from '../storage';
import { GameState, Territory, FactionData, Samurai, Legion, SpecialProduct, InitialData, OperationRecord } from '../types';

/**
 * 导出数据格式
 */
export interface ExportData {
  version: string;
  exportedAt: string;
  data: {
    gameState: GameState;
    territories: Territory[];
    factions: FactionData[];
    samurais: Samurai[];
    legions: Legion[];
    specialProducts: SpecialProduct[];
    initialData: InitialData | null;
    operationRecords: OperationRecord[];
  };
}

/**
 * 导出所有游戏数据
 * Requirements: 1.1, 1.2, 1.3
 */
export function exportAllData(): ExportData {
  const exportData: ExportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      gameState: getGameState(),
      territories: getTerritories(),
      factions: getFactions(),
      samurais: getSamurais(),
      legions: getLegions(),
      specialProducts: getSpecialProducts(),
      initialData: getInitialData(),
      operationRecords: getOperationRecords(),
    },
  };

  return exportData;
}
