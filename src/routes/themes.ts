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

  // Create a new theme with optional parent and create values for all tokens
  fastify.post('/themes', async (request, reply) => {
    const { name, parentId, defaultValue } = request.body as {
      name: string;
      parentId?: number;
      defaultValue?: string;
    };
    if (!name) {
      return reply.status(400).send({ error: 'Theme name is required' });
    }
    // Create the theme
    let theme;
    try {
      theme = await prisma.theme.create({
        data: {
          name,
          parentId,
        },
      });
    } catch (e) {
      return reply.status(400).send({ error: 'Theme name must be unique' });
    }
    // Get all tokens
    const tokens = await prisma.token.findMany({ select: { id: true } });
    // Create a value for each token for this theme
    if (tokens.length > 0) {
      await prisma.tokenValue.createMany({
        data: tokens.map(token => ({
          value: defaultValue ?? '',
          tokenId: token.id,
          themeId: theme.id,
        })),
      });
    }
    return reply.status(201).send(theme);
  });

  // Delete a theme and all its values
  fastify.delete('/themes/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.theme.delete({
        where: { id: parseInt(id) },
      });
      return reply.status(204).send();
    } catch (e) {
      return reply.status(404).send({ error: 'Theme not found' });
    }
  });
}
