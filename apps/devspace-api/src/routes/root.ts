import { Hono } from 'hono';

export const routes = new Hono().get('/health', (c) =>
  c.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  })
);
