import { Hono } from 'hono';
import { StatsController } from './presentation/stats.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';
import { errorHandler } from '../../shared/middleware/error-handler.js';

const statsRoutes = new Hono();
const statsController = new StatsController();

// ミドルウェア適用
statsRoutes.use('*', authMiddleware());

// エラーハンドラー設定
statsRoutes.onError(errorHandler);

// ルート定義
statsRoutes.get('/daily-average', (c) => statsController.getDailyAverage(c));

export { statsRoutes };