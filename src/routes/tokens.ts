import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function tokenRoutes(fastify: FastifyInstance) {
  fastify.get('/tokens', async (request, reply) => {
    const tokens = await prisma.token.findMany({
      include: {
        tokenValues: {
          include: {
            theme: true,
          },
        },
      },
    });
    return tokens;
  });

  fastify.get('/tokens/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const token = await prisma.token.findUnique({
      where: { id: parseInt(id) },
      include: {
        tokenValues: {
          include: {
            theme: true,
          },
        },
      },
    });

    if (!token) {
      return reply.status(404).send({ error: 'Token not found' });
    }

    return token;
  });
}
