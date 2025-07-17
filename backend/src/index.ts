import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { meetingRoutes } from './modules/meeting/meeting.routes.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { statsRoutes } from './modules/stats/stats.routes.js';

const app = new Hono();

// Middleware
app.use('*', logger());
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

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

const port = Number(process.env.PORT) || 3001;

console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port
});