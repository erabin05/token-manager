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
}
