import { FastifyInstance } from 'fastify';

export default async function (fastify: FastifyInstance) {
  fastify.get('/hello', async function () {
    return { message: 'Hello API' };
  });

  fastify.get('/', async function () {
    return { message: 'Welcome to the DevSpace API' };
  });
}
