import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { prettyJSON } from 'hono/pretty-json';
import { allRoutes } from './routes/index.js';
import { serve } from '@hono/node-server';

export const app = new Hono();

app.use('*', logger()).use('*', prettyJSON()).use(cors());

// Mount routes directly at root for Vercel
app.route('', allRoutes);

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.env.NODE_ENV === 'development'
) {
  // For local development, create a separate app with /api prefix
  const rootApp = new Hono();
  rootApp.route('/api', app);

  serve({
    fetch: rootApp.fetch,
    port: 3001,
  });
  console.log('Server running on http://localhost:3001');
  console.log('API available at http://localhost:3001/api');
}
