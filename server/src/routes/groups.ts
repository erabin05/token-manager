import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import { TokenGroup } from '@prisma/client';
import {
  authenticateUser,
  requirePermission,
  AuthenticatedRequest,
} from '../lib/auth';

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
  // Hook d'authentification pour toutes les routes
  fastify.addHook('preHandler', authenticateUser);

  // GET /groups - Lecture des groupes (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/groups',
    {
      preHandler: requirePermission('groups:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const groups = await prisma.tokenGroup.findMany({
        orderBy: { id: 'asc' },
        include: {
          children: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          },
          tokens: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      const nested = buildGroupTree(groups as unknown as GroupNode[]);
      return nested;
    }
  );

  // GET /groups/:id - Lecture d'un groupe spécifique (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/groups/:id',
    {
      preHandler: requirePermission('groups:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const group = await prisma.tokenGroup.findUnique({
        where: { id: parseInt(id) },
        include: {
          children: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          },
          tokens: {
            select: {
              id: true,
              name: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      if (!group) {
        return reply.status(404).send({ error: 'Group not found' });
      }
      return group;
    }
  );

  // POST /groups - Création d'un groupe (MAINTAINER, ADMIN)
  fastify.post(
    '/groups',
    {
      preHandler: requirePermission('groups:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
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
        include: {
          children: {
            select: {
              id: true,
              name: true,
            },
          },
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return reply.status(201).send(group);
    }
  );

  // PUT /groups/:id - Mise à jour d'un groupe (MAINTAINER, ADMIN)
  fastify.put(
    '/groups/:id',
    {
      preHandler: requirePermission('groups:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const groupId = parseInt(id);
      const { name, parentId } = request.body as {
        name?: string;
        parentId?: number;
      };

      try {
        const group = await prisma.tokenGroup.update({
          where: { id: groupId },
          data: { name, parentId },
          include: {
            children: {
              select: {
                id: true,
                name: true,
              },
            },
            parent: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return group;
      } catch (error: any) {
        if (error.code === 'P2025') {
          reply.status(404).send({ error: 'Group not found' });
        } else {
          reply.status(500).send({ error: 'Failed to update group' });
        }
      }
    }
  );

  // DELETE /groups/:id - Suppression d'un groupe (MAINTAINER, ADMIN)
  fastify.delete(
    '/groups/:id',
    {
      preHandler: requirePermission('groups:delete'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      try {
        await prisma.tokenGroup.delete({
          where: { id: parseInt(id) },
        });
        return reply.status(204).send();
      } catch (e) {
        return reply.status(404).send({ error: 'Group not found' });
      }
    }
  );
}
