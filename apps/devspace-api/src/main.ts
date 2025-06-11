import Fastify from 'fastify';
import { app } from './app/app';

const server = Fastify({
  logger: true,
});

server.register(app);

if (process.env.NODE_ENV !== 'production') {
  const host = process.env.HOST ?? 'localhost';
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;

  const start = async () => {
    try {
      await server.listen({ port, host });
      console.log(`Server is running at http://${host}:${port}`);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };
  start();
}

export default async function handler(req: any, res: any) {
  try {
    await server.ready();
    const response = await server.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      body: req.body,
    });

    for (const [key, value] of Object.entries(response.headers)) {
      res.setHeader(key, value);
    }

    res.statusCode = response.statusCode;
    res.end(response.payload);
  } catch (error) {
    console.error('Error handling request:', error);
    res.statusCode = 500;
    res.end('Internal Server Error');
  }
}
