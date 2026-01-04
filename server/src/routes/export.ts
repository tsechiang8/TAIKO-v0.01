/**
 * 数据导出路由
 * Requirements: 1.1-1.4
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { exportAllData } from '../services/export';

const router = Router();

// 所有导出路由都需要认证和管理员权限
router.use(requireAuth, requireAdmin);

/**
 * POST /api/export/data
 * 导出所有游戏数据
 * Requirements: 1.1, 1.2, 1.3
 */
router.post('/data', (req: Request, res: Response) => {
  try {
    const exportData = exportAllData();
    
    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    console.error('导出数据失败:', error);
    res.status(500).json({
      success: false,
      error: '导出数据失败',
    });
  }
});

export default router;
