import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { handle } from '@hono/node-server/vercel';
import { prettyJSON } from 'hono/pretty-json';
import { routes } from './routes/root.js';

const app = new Hono();

app.use('*', logger()).use('*', prettyJSON()).use(cors());

app.route('', routes);
app.get('/', (c) => c.json({ message: 'Welcome to DevSpace API' }));

if (process.env.NODE_ENV === 'development') {
  serve({
    fetch: app.fetch,
    port: 3001,
  });
}

export default handle(app);
