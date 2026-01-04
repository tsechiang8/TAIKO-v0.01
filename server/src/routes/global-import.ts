/**
 * 全局数据导入路由
 */

import { Router, Request, Response } from 'express';
import { requireAuth, requireAdmin } from '../auth/middleware';
import { importGlobalData } from '../services/global-import';

const router = Router();

// 所有全局导入路由都需要认证和管理员权限
router.use(requireAuth, requireAdmin);

/**
 * POST /api/global-import/data
 * 导入完整的游戏数据
 */
router.post('/data', (req: Request, res: Response) => {
  try {
    const { jsonData } = req.body;

    if (!jsonData || typeof jsonData !== 'string') {
      res.status(400).json({
        success: false,
        error: '请提供有效的 JSON 数据',
      });
      return;
    }

    const result = importGlobalData(jsonData);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: result.message,
        details: {
          errors: result.errors,
        },
      });
      return;
    }

    res.json({
      success: true,
      message: result.message,
      data: result.summary,
    });
  } catch (error) {
    console.error('全局导入失败:', error);
    res.status(500).json({
      success: false,
      error: '服务器错误',
    });
  }
});

export default router;
