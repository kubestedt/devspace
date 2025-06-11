import Fastify from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
import { app } from './app/app';

interface VercelRequest extends IncomingMessage {
  query: Record<string, string>;
  cookies: Record<string, string>;
  body: any;
}

interface VercelResponse extends ServerResponse {
  send: (body: any) => void;
  json: (obj: any) => void;
}

const server = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    serializers: {
      req(request) {
        return {
          method: request.method,
          url: request.url,
          parameters: request.params,
          headers: request.headers,
        };
      },
    },
  },
});

server.register(app);

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT ? Number(process.env.PORT) : 3001;
  const start = async () => {
    try {
      await server.listen({ port, host: '0.0.0.0' });
      server.log.info(`Server is running on port ${port}`);
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };
  start();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await server.ready();

    const response = await server.inject({
      method: req.method,
      url: req.url,
      headers: req.headers,
      payload: req.body,
      query: req.query,
    });

    const securityHeaders = {
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    [
      ...Object.entries(response.headers),
      ...Object.entries(securityHeaders),
    ].forEach(([key, value]: [string, unknown]) => {
      if (value) {
        const headerValue = Array.isArray(value) ? value : String(value);
        res.setHeader(key, headerValue);
      }
    });

    if (process.env.NODE_ENV === 'production') {
      res.setHeader(
        'Access-Control-Allow-Origin',
        process.env.ALLOWED_ORIGINS || '*'
      );
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,POST,PUT,DELETE,OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type,Authorization'
      );
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    res.statusCode = response.statusCode;
    res.end(response.payload);

    server.log.info({
      status: response.statusCode,
      path: req.url,
      method: req.method,
      duration: response.headers['x-response-time'],
    });
  } catch (error) {
    server.log.error({
      error,
      path: req.url,
      method: req.method,
      body: req.body,
    });

    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({
        error: 'Internal Server Error',
        requestId: req.headers['x-request-id'] || 'unknown',
        timestamp: new Date().toISOString(),
      })
    );
  }
}
