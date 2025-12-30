import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import {
  FactionData,
  Territory,
  Samurai,
  Legion,
  SpecialProduct,
  GameState,
  DataSnapshot,
  OperationRecord,
  ErrorReport,
  InitialData,
} from '../types';

// 数据目录路径
const DATA_DIR = path.join(__dirname, '../../data');
const SNAPSHOTS_DIR = path.join(DATA_DIR, 'snapshots');

// 确保数据目录存在
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    fs.mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  }
}

// 数据文件路径
const getFilePath = (filename: string): string => path.join(DATA_DIR, filename);
const getSnapshotPath = (snapshotId: string): string => 
  path.join(SNAPSHOTS_DIR, `${snapshotId}.json`);

// 通用读取函数
export function readJsonFile<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = getFilePath(filename);
  
  if (!fs.existsSync(filePath)) {
    return defaultValue;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`读取文件 ${filename} 失败:`, error);
    return defaultValue;
  }
}

// 通用写入函数
export function writeJsonFile<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = getFilePath(filename);
  
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`写入文件 ${filename} 失败:`, error);
    throw error;
  }
}

// 势力数据操作
export function getFactions(): FactionData[] {
  return readJsonFile<FactionData[]>('factions.json', []);
}

export function saveFactions(factions: FactionData[]): void {
  writeJsonFile('factions.json', factions);
}

export function getFactionById(id: string): FactionData | undefined {
  return getFactions().find(f => f.id === id);
}

export function getFactionByCode(code: string): FactionData | undefined {
  return getFactions().find(f => f.code === code);
}

// 领地数据操作
export function getTerritories(): Territory[] {
  return readJsonFile<Territory[]>('territories.json', []);
}

export function saveTerritories(territories: Territory[]): void {
  writeJsonFile('territories.json', territories);
}

// 武士数据操作
export function getSamurais(): Samurai[] {
  return readJsonFile<Samurai[]>('samurais.json', []);
}

export function saveSamurais(samurais: Samurai[]): void {
  writeJsonFile('samurais.json', samurais);
}

// 军团数据操作
export function getLegions(): Legion[] {
  return readJsonFile<Legion[]>('legions.json', []);
}

export function saveLegions(legions: Legion[]): void {
  writeJsonFile('legions.json', legions);
}

// 特产数据操作
export function getSpecialProducts(): SpecialProduct[] {
  return readJsonFile<SpecialProduct[]>('special-products.json', []);
}

export function saveSpecialProducts(products: SpecialProduct[]): void {
  writeJsonFile('special-products.json', products);
}

/**
 * 生成安全密钥
 * Requirements: 8.3 - 包含大小写字母、数字和特殊字符，长度至少32位
 */
export function generateSecurityKey(): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const special = '!@#$%^&*';
  const allChars = uppercase + lowercase + numbers + special;
  
  // 确保至少包含每种字符类型
  let key = '';
  key += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  key += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  key += numbers.charAt(Math.floor(Math.random() * numbers.length));
  key += special.charAt(Math.floor(Math.random() * special.length));
  
  // 填充剩余字符到32位
  for (let i = 4; i < 32; i++) {
    key += allChars.charAt(Math.floor(Math.random() * allChars.length));
  }
  
  // 打乱顺序
  const keyArray = key.split('');
  for (let i = keyArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [keyArray[i], keyArray[j]] = [keyArray[j], keyArray[i]];
  }
  
  return keyArray.join('');
}

// 游戏状态操作
export function getGameState(): GameState {
  const defaultState: GameState = {
    currentYear: 1,
    isLocked: false,
    adminCode: 'admin',
  };
  
  const state = readJsonFile<GameState>('game-state.json', defaultState);
  
  // 如果没有安全密钥，自动生成一个
  if (!state.securityKey) {
    state.securityKey = generateSecurityKey();
    saveGameState(state);
    console.log('已自动生成安全密钥');
  }
  
  return state;
}

export function saveGameState(state: GameState): void {
  writeJsonFile('game-state.json', state);
}

// 操作记录
const MAX_OPERATION_RECORDS = 100;

export function getOperationRecords(): OperationRecord[] {
  return readJsonFile<OperationRecord[]>('operation-records.json', []);
}

export function saveOperationRecords(records: OperationRecord[]): void {
  writeJsonFile('operation-records.json', records);
}

export function addOperationRecord(record: Omit<OperationRecord, 'id' | 'timestamp'>): OperationRecord {
  const records = getOperationRecords();
  const newRecord: OperationRecord = {
    ...record,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
  
  records.unshift(newRecord);
  
  // 保留最近100条
  if (records.length > MAX_OPERATION_RECORDS) {
    records.splice(MAX_OPERATION_RECORDS);
  }
  
  saveOperationRecords(records);
  return newRecord;
}

// 错误报告
export function getErrorReports(): ErrorReport[] {
  return readJsonFile<ErrorReport[]>('error-reports.json', []);
}

export function saveErrorReports(reports: ErrorReport[]): void {
  writeJsonFile('error-reports.json', reports);
}

export function addErrorReport(report: Omit<ErrorReport, 'id' | 'timestamp'>): ErrorReport {
  const reports = getErrorReports();
  const newReport: ErrorReport = {
    ...report,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  };
  
  reports.unshift(newReport);
  saveErrorReports(reports);
  return newReport;
}

// 数据快照功能
export function createSnapshot(operationId: string): DataSnapshot {
  ensureDataDir();
  
  const snapshot: DataSnapshot = {
    id: uuidv4(),
    timestamp: new Date().toISOString(),
    operationId,
    data: {
      factions: getFactions(),
      territories: getTerritories(),
      samurais: getSamurais(),
      legions: getLegions(),
      specialProducts: getSpecialProducts(),
      gameState: getGameState(),
    },
  };
  
  const snapshotPath = getSnapshotPath(snapshot.id);
  fs.writeFileSync(snapshotPath, JSON.stringify(snapshot, null, 2), 'utf-8');
  
  return snapshot;
}

export function getSnapshot(snapshotId: string): DataSnapshot | null {
  const snapshotPath = getSnapshotPath(snapshotId);
  
  if (!fs.existsSync(snapshotPath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(snapshotPath, 'utf-8');
    return JSON.parse(content) as DataSnapshot;
  } catch (error) {
    console.error(`读取快照 ${snapshotId} 失败:`, error);
    return null;
  }
}

export function restoreFromSnapshot(snapshotId: string): boolean {
  const snapshot = getSnapshot(snapshotId);
  
  if (!snapshot) {
    return false;
  }
  
  try {
    saveFactions(snapshot.data.factions);
    saveTerritories(snapshot.data.territories);
    saveSamurais(snapshot.data.samurais);
    saveLegions(snapshot.data.legions);
    saveSpecialProducts(snapshot.data.specialProducts);
    saveGameState(snapshot.data.gameState);
    return true;
  } catch (error) {
    console.error(`恢复快照 ${snapshotId} 失败:`, error);
    return false;
  }
}

// 获取所有快照列表（用于回溯功能）
export function listSnapshots(): { id: string; timestamp: string; operationId: string }[] {
  ensureDataDir();
  
  if (!fs.existsSync(SNAPSHOTS_DIR)) {
    return [];
  }
  
  const files = fs.readdirSync(SNAPSHOTS_DIR);
  const snapshots: { id: string; timestamp: string; operationId: string }[] = [];
  
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(path.join(SNAPSHOTS_DIR, file), 'utf-8');
        const snapshot = JSON.parse(content) as DataSnapshot;
        snapshots.push({
          id: snapshot.id,
          timestamp: snapshot.timestamp,
          operationId: snapshot.operationId,
        });
      } catch {
        // 忽略无效文件
      }
    }
  }
  
  return snapshots.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

// 清理旧快照（保留最近N个）
export function cleanupOldSnapshots(keepCount: number = 20): void {
  const snapshots = listSnapshots();
  
  if (snapshots.length <= keepCount) {
    return;
  }
  
  const toDelete = snapshots.slice(keepCount);
  
  for (const snapshot of toDelete) {
    const snapshotPath = getSnapshotPath(snapshot.id);
    if (fs.existsSync(snapshotPath)) {
      fs.unlinkSync(snapshotPath);
    }
  }
}

// 删除指定操作之后的所有快照（用于回溯功能）
export function deleteSnapshotsAfterOperation(operationId: string): number {
  const records = getOperationRecords();
  const snapshots = listSnapshots();
  
  // 找到目标操作的索引
  const targetIndex = records.findIndex(r => r.id === operationId);
  if (targetIndex === -1) {
    return 0;
  }
  
  // 获取目标操作之后的所有操作ID（索引更小的是更新的记录）
  const operationsToDelete = records.slice(0, targetIndex).map(r => r.id);
  const operationIdsToDelete = new Set(operationsToDelete);
  
  // 删除这些操作对应的快照
  let deletedCount = 0;
  for (const snapshot of snapshots) {
    if (operationIdsToDelete.has(snapshot.operationId)) {
      const snapshotPath = getSnapshotPath(snapshot.id);
      if (fs.existsSync(snapshotPath)) {
        fs.unlinkSync(snapshotPath);
        deletedCount++;
      }
    }
  }
  
  return deletedCount;
}

// 删除指定操作之后的所有操作记录（用于回溯功能）
export function deleteOperationRecordsAfterOperation(operationId: string): number {
  const records = getOperationRecords();
  
  // 找到目标操作的索引
  const targetIndex = records.findIndex(r => r.id === operationId);
  if (targetIndex === -1) {
    return 0;
  }
  
  // 保留目标操作及之前的记录（索引更大的是更旧的记录）
  const remainingRecords = records.slice(targetIndex);
  const deletedCount = targetIndex;
  
  saveOperationRecords(remainingRecords);
  
  return deletedCount;
}

// 获取当前所有数据（用于比较）
export function getAllData(): DataSnapshot['data'] {
  return {
    factions: getFactions(),
    territories: getTerritories(),
    samurais: getSamurais(),
    legions: getLegions(),
    specialProducts: getSpecialProducts(),
    gameState: getGameState(),
  };
}

// ============ 初始数据管理 (用于重置系统) ============

const INITIAL_DATA_FILE = 'initial-territories.json';

/**
 * 获取初始数据
 * Requirements: 2.5.6
 */
export function getInitialData(): InitialData | null {
  ensureDataDir();
  const filePath = getFilePath(INITIAL_DATA_FILE);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as InitialData;
  } catch (error) {
    console.error('读取初始数据失败:', error);
    return null;
  }
}

/**
 * 保存当前郡国数据为初始数据
 * Requirements: 2.5.1, 2.5.6
 */
export function saveAsInitialData(): InitialData {
  ensureDataDir();
  const territories = getTerritories();
  
  const initialData: InitialData = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    territories: territories.map(t => ({
      ...t,
      // 清除势力和军团关联，只保留基础数据
      factionId: undefined,
      garrisonLegionId: undefined,
    })),
  };
  
  const filePath = getFilePath(INITIAL_DATA_FILE);
  fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
  
  return initialData;
}

/**
 * 更新初始数据
 * Requirements: 2.5.5
 */
export function updateInitialData(territories: Territory[]): InitialData {
  ensureDataDir();
  
  const initialData: InitialData = {
    version: '1.0',
    createdAt: new Date().toISOString(),
    territories: territories.map(t => ({
      ...t,
      // 清除势力和军团关联，只保留基础数据
      factionId: undefined,
      garrisonLegionId: undefined,
    })),
  };
  
  const filePath = getFilePath(INITIAL_DATA_FILE);
  fs.writeFileSync(filePath, JSON.stringify(initialData, null, 2), 'utf-8');
  
  return initialData;
}

/**
 * 检查初始数据是否存在
 */
export function hasInitialData(): boolean {
  ensureDataDir();
  const filePath = getFilePath(INITIAL_DATA_FILE);
  return fs.existsSync(filePath);
}

/**
 * 首次启动时自动保存初始数据
 * Requirements: 2.5.1
 */
export function ensureInitialData(): void {
  if (!hasInitialData()) {
    const territories = getTerritories();
    if (territories.length > 0) {
      saveAsInitialData();
      console.log('已自动保存初始郡国数据');
    }
  }
}
