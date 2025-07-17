import { Hono } from 'hono';
import { StatsController } from './presentation/stats.controller.js';
import { authMiddleware } from '../../middlewares/auth.middleware.js';

const statsRoutes = new Hono();
const statsController = new StatsController();

// 認証必須のルート
statsRoutes.use('*', authMiddleware());

// 日次平均会議時間を取得
statsRoutes.get('/daily-average', (c) => statsController.getDailyAverage(c));

export { statsRoutes };