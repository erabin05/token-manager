import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';

export default async function themeRoutes(fastify: FastifyInstance) {
  fastify.get('/themes', async (request, reply) => {
    const themes = await prisma.theme.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return themes;
  });
}
