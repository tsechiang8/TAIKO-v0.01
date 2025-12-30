/**
 * 游戏进程控制路由
 * Requirements: 9.1-9.7
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../auth/middleware';
import {
  // 下一年结算
  advanceYear,
  // 锁定/解锁
  isGameLocked,
  getCurrentYear,
  lockGame,
  unlockGame,
  checkPlayerOperationAllowed,
  // 记账推演
  getAccountingLogs,
  addAccountingLog,
  filterAccountingLogs,
  deleteAccountingLog,
  deleteAccountingLogsByYear,
  // 操作记录与回溯
  getRecentOperations,
  getRollbackableOperations,
  rollbackToOperation,
  getGameStatusSummary,
  getPlayerRecentOperations,
  // 重置系统
  executeReset,
  canReset,
  getInitialDataStatus,
  saveCurrentAsInitialData,
  // 管理员代码
  updateAdminCode,
  getSecurityKey,
} from '../services/game-progress';
import { getInitialData, updateInitialData } from '../storage';
import { Territory } from '../types';

const router = Router();

// ============ 游戏状态 API ============

/**
 * GET /api/game/status
 * 获取游戏状态（公开）
 */
router.get('/status', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      currentYear: getCurrentYear(),
      isLocked: isGameLocked(),
    },
  });
});

/**
 * GET /api/game/status/summary
 * 获取游戏状态摘要（管理员）
 */
router.get('/status/summary', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const summary = getGameStatusSummary();
  res.json({
    success: true,
    data: summary,
  });
});

/**
 * GET /api/game/check-operation
 * 检查玩家操作是否被允许
 */
router.get('/check-operation', requireAuth, (req: Request, res: Response) => {
  const result = checkPlayerOperationAllowed();
  res.json({
    success: true,
    data: result,
  });
});

// ============ 下一年结算 API (Requirements: 9.1, 9.2) ============

/**
 * POST /api/game/advance-year
 * 执行下一年结算（管理员）
 */
router.post('/advance-year', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const result = advanceYear();

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    data: result.settlement,
    message: `已进入第${result.settlement?.year}年`,
  });
});

// ============ 锁定/解锁 API (Requirements: 9.3, 9.4) ============

/**
 * POST /api/game/lock
 * 锁定游戏（管理员）
 */
router.post('/lock', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const result = lockGame();

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '游戏已锁定',
  });
});

/**
 * POST /api/game/unlock
 * 解锁游戏（管理员）
 */
router.post('/unlock', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const result = unlockGame();

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '游戏已解锁',
  });
});

// ============ 记账推演 API (Requirements: 9.5) ============

/**
 * GET /api/game/accounting-logs
 * 获取记账日志（管理员）
 */
router.get('/accounting-logs', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { year, factionId, shouldCalculate } = req.query;

  const params: { year?: number; factionId?: string; shouldCalculate?: boolean } = {};
  
  if (year !== undefined) {
    params.year = Number(year);
  }
  if (factionId) {
    params.factionId = factionId as string;
  }
  if (shouldCalculate !== undefined) {
    params.shouldCalculate = shouldCalculate === 'true';
  }

  const hasFilters = Object.keys(params).length > 0;
  const logs = hasFilters ? filterAccountingLogs(params) : getAccountingLogs();

  res.json({
    success: true,
    data: logs,
    total: logs.length,
  });
});

/**
 * POST /api/game/accounting-logs
 * 添加记账日志（管理员）
 */
router.post('/accounting-logs', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { year, factionId, content, shouldCalculate } = req.body;

  if (year === undefined || !factionId || !content) {
    res.status(400).json({
      success: false,
      error: '年份、势力和内容为必填项',
    });
    return;
  }

  const result = addAccountingLog({
    year: Number(year),
    factionId,
    content,
    shouldCalculate: shouldCalculate ?? false,
  });

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.status(201).json({
    success: true,
    data: result.log,
    message: '记账日志添加成功',
  });
});

/**
 * DELETE /api/game/accounting-logs/:logId
 * 删除记账日志（管理员）
 */
router.delete('/accounting-logs/:logId', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { logId } = req.params;
  const result = deleteAccountingLog(logId);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '日志删除成功',
  });
});

/**
 * DELETE /api/game/accounting-logs/year/:year
 * 批量删除某年的记账日志（管理员）
 */
router.delete('/accounting-logs/year/:year', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const year = Number(req.params.year);
  
  if (isNaN(year)) {
    res.status(400).json({
      success: false,
      error: '无效的年份',
    });
    return;
  }

  const result = deleteAccountingLogsByYear(year);

  res.json({
    success: true,
    message: `已删除${result.deletedCount}条日志`,
    deletedCount: result.deletedCount,
  });
});

// ============ 操作记录与回溯 API (Requirements: 9.6, 9.7) ============

/**
 * GET /api/game/operations
 * 获取操作记录（管理员）
 */
router.get('/operations', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 100;
  const operations = getRecentOperations(limit);

  res.json({
    success: true,
    data: operations,
    total: operations.length,
  });
});

/**
 * GET /api/game/operations/rollbackable
 * 获取可回溯的操作记录（管理员）
 */
router.get('/operations/rollbackable', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const limit = req.query.limit ? Number(req.query.limit) : 20;
  const operations = getRollbackableOperations(limit);

  res.json({
    success: true,
    data: operations,
    total: operations.length,
  });
});

/**
 * POST /api/game/rollback/:operationId
 * 回溯到指定操作（管理员）
 */
router.post('/rollback/:operationId', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { operationId } = req.params;
  const result = rollbackToOperation(operationId);

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '数据已回溯',
  });
});

/**
 * GET /api/game/player-operations/:factionId
 * 获取玩家最近操作记录（用于错误报告）
 */
router.get('/player-operations/:factionId', requireAuth, (req: Request, res: Response) => {
  const { factionId } = req.params;
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const operations = getPlayerRecentOperations(factionId, limit);

  res.json({
    success: true,
    data: operations,
  });
});

// ============ 重置系统 API (Requirements: 6.1-6.5) ============

/**
 * GET /api/game/reset/status
 * 获取重置系统状态（管理员）
 */
router.get('/reset/status', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const canResetResult = canReset();
  const initialDataStatus = getInitialDataStatus();

  res.json({
    success: true,
    data: {
      canReset: canResetResult.canReset,
      reason: canResetResult.reason,
      initialData: initialDataStatus,
    },
  });
});

/**
 * POST /api/game/reset
 * 执行游戏重置（管理员）
 * Requirements: 6.2, 6.3
 */
router.post('/reset', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { confirmText } = req.body;

  // 验证确认文本 (Requirements: 6.2)
  if (confirmText !== '确认重置') {
    res.status(400).json({
      success: false,
      error: '确认文本不正确',
    });
    return;
  }

  const result = executeReset();

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '游戏已重置到初始状态',
  });
});

/**
 * GET /api/game/initial-data
 * 获取初始数据（管理员）
 * Requirements: 2.5.2
 */
router.get('/initial-data', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const initialData = getInitialData();

  if (!initialData) {
    res.status(404).json({
      success: false,
      error: '初始数据不存在',
    });
    return;
  }

  res.json({
    success: true,
    data: initialData,
  });
});

/**
 * POST /api/game/initial-data/save
 * 保存当前数据为初始数据（管理员）
 * Requirements: 2.5.1
 */
router.post('/initial-data/save', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const result = saveCurrentAsInitialData();

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '当前数据已保存为初始数据',
  });
});

/**
 * PUT /api/game/initial-data
 * 更新初始数据（管理员）
 * Requirements: 2.5.5
 */
router.put('/initial-data', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { territories } = req.body;

  if (!territories || !Array.isArray(territories)) {
    res.status(400).json({
      success: false,
      error: '无效的郡国数据',
    });
    return;
  }

  try {
    updateInitialData(territories as Territory[]);
    res.json({
      success: true,
      message: '初始数据已更新',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新初始数据失败',
    });
  }
});

// ============ 管理员安全设置 API (Requirements: 8.1, 8.5, 8.6) ============

/**
 * PUT /api/game/admin-code
 * 修改管理员代码（管理员）
 * Requirements: 8.1, 8.5
 */
router.put('/admin-code', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const { newCode } = req.body;

  if (!newCode || typeof newCode !== 'string' || newCode.trim().length === 0) {
    res.status(400).json({
      success: false,
      error: '请提供有效的新管理员代码',
    });
    return;
  }

  const result = updateAdminCode(newCode.trim());

  if (!result.success) {
    res.status(400).json({
      success: false,
      error: result.error,
    });
    return;
  }

  res.json({
    success: true,
    message: '管理员代码已更新',
  });
});

/**
 * GET /api/game/security-key
 * 获取安全密钥（管理员）
 * Requirements: 8.6
 */
router.get('/security-key', requireAuth, requireAdmin, (req: Request, res: Response) => {
  const securityKey = getSecurityKey();

  res.json({
    success: true,
    data: {
      securityKey,
    },
  });
});

export default router;
