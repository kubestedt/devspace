import { Hono } from 'hono';

export const routes = new Hono()
  .get('/', (c) =>
    c.json({
      success: true,
      message: 'Welcome to DevSpace API',
    })
  )
  .get('/health', (c) =>
    c.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  );
