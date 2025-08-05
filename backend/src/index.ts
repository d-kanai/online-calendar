import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { meetingRoutes } from './modules/meeting/meeting.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { statsRoutes } from './modules/stats/stats.routes.js';
import { testDataRoutes } from './routes/test-data.routes.js';
import { errorHandler } from './middleware/error-handler.js';
import { requestLogger } from './middleware/request-logger.js';

const app = new Hono();

// Middleware
app.use('*', requestLogger);  // カスタムリクエストロガー
app.use('*', logger());       // 標準のロガーも併用
app.use('*', errorHandler);   // エラーハンドリング
app.use('*', cors({
  origin: ['http://localhost:3000'], // Frontend URL
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/v1', (c) => {
  return c.json({ message: 'Online Calendar API v1', version: '1.0.0' });
});

// Module routes
app.route('/api/v1/auth', authRoutes);
app.route('/api/v1/meetings', meetingRoutes);
app.route('/api/v1/stats', statsRoutes);

// Test data routes (開発環境のみ)
if (process.env.NODE_ENV !== 'production') {
  app.route('/api/v1/test-data', testDataRoutes);
}

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Global error handler (errorHandlerミドルウェアで処理されなかったエラー用)
app.onError((err, c) => {
  console.error('🚨 Unhandled error in onError:');
  console.error('  Error:', err);
  console.error('  Stack:', err.stack);
  console.error('  Request:', {
    method: c.req.method,
    url: c.req.url,
    headers: Object.fromEntries(c.req.raw.headers.entries())
  });
  
  return c.json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500);
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});