import { Hono } from 'hono';
import { TestDataController } from '../controllers/test-data.controller.js';

const testDataRoutes = new Hono();
const testDataController = new TestDataController();

// 認証不要のテスト用エンドポイント
testDataRoutes.post('/setup', (c) => testDataController.setupData(c));
testDataRoutes.post('/reset', (c) => testDataController.resetAll(c));

export { testDataRoutes };