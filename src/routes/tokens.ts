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

  // Create a new token with a value for each theme
  fastify.post('/tokens', async (request, reply) => {
    const { name, groupId, defaultValue } = request.body as {
      name: string;
      groupId?: number;
      defaultValue?: string;
    };
    if (!name) {
      return reply.status(400).send({ error: 'Token name is required' });
    }
    // Get all themes
    const themes = await prisma.theme.findMany({ select: { id: true } });
    if (themes.length === 0) {
      return reply
        .status(400)
        .send({ error: 'No themes found. Please create at least one theme.' });
    }
    // Create the token and its values for each theme
    const token = await prisma.token.create({
      data: {
        name,
        groupId,
        tokenValues: {
          create: themes.map(theme => ({
            value: defaultValue ?? '',
            themeId: theme.id,
          })),
        },
      },
      include: {
        tokenValues: true,
      },
    });
    return reply.status(201).send(token);
  });

  // Delete a token and all its values
  fastify.delete('/tokens/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.token.delete({
        where: { id: parseInt(id) },
      });
      return reply.status(204).send();
    } catch (e) {
      return reply.status(404).send({ error: 'Token not found' });
    }
  });
}
