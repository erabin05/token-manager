import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { TokenGroup } from '@prisma/client';

type GroupNode = TokenGroup & { children?: GroupNode[] };

function buildGroupTree(
  groups: GroupNode[],
  parentId: number | null = null
): GroupNode[] {
  return groups
    .filter(g => g.parentId === parentId)
    .map(g => ({
      ...g,
      children: buildGroupTree(groups, g.id),
    }));
}

export default async function groupRoutes(fastify: FastifyInstance) {
  fastify.get('/groups/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const group = await prisma.tokenGroup.findUnique({
      where: { id: parseInt(id) },
      include: {
        children: true,
        tokens: true,
      },
    });
    if (!group) {
      return reply.status(404).send({ error: 'Group not found' });
    }
    return group;
  });

  fastify.get('/groups', async (request, reply) => {
    const groups = await prisma.tokenGroup.findMany({
      orderBy: { id: 'asc' },
    });
    const nested = buildGroupTree(groups as GroupNode[]);
    return nested;
  });

  // Create a new group with optional parent
  fastify.post('/groups', async (request, reply) => {
    const { name, parentId } = request.body as {
      name: string;
      parentId?: number;
    };
    if (!name) {
      return reply.status(400).send({ error: 'Group name is required' });
    }
    // Create the group
    const group = await prisma.tokenGroup.create({
      data: {
        name,
        parentId,
      },
    });
    return reply.status(201).send(group);
  });

  // Delete a group and all its children and tokens
  fastify.delete('/groups/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.tokenGroup.delete({
        where: { id: parseInt(id) },
      });
      return reply.status(204).send();
    } catch (e) {
      return reply.status(404).send({ error: 'Group not found' });
    }
  });
}
