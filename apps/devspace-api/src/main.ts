import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { handle } from '@hono/node-server/vercel';
import { prettyJSON } from 'hono/pretty-json';
import { routes } from './routes/root';

const app = new Hono();

app
  .use('*', logger())
  .use('*', prettyJSON())
  .use(
    '*',
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
      credentials: true,
    })
  );

app.route('/', routes);

if (process.env.NODE_ENV !== 'production') {
  serve({
    fetch: app.fetch,
    port: 3001,
  });
}

export default handle(app);
