import { Hono } from 'hono';

export const routes = new Hono()
  .get('/', (c) => c.json({ message: 'Welcome to DevSpace API' }))
  .get('/health', (c) =>
    c.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  )
  .get('/version', (c) =>
    c.json({
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    })
  )
  .get('/ping', (c) => c.text('pong'));
