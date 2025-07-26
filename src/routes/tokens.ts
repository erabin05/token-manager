import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import {
  authenticateUser,
  requirePermission,
  AuthenticatedRequest,
} from '../lib/auth';

export default async function tokenRoutes(fastify: FastifyInstance) {
  // Hook d'authentification pour toutes les routes
  fastify.addHook('preHandler', authenticateUser);

  // GET /tokens - Lecture des tokens (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/tokens',
    {
      preHandler: requirePermission('tokens:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const tokens = await prisma.token.findMany({
        include: {
          tokenValues: {
            include: {
              theme: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return tokens;
    }
  );

  // GET /tokens/:id - Lecture d'un token spécifique (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/tokens/:id',
    {
      preHandler: requirePermission('tokens:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const token = await prisma.token.findUnique({
        where: { id: parseInt(id) },
        include: {
          tokenValues: {
            include: {
              theme: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!token) {
        return reply.status(404).send({ error: 'Token not found' });
      }

      return token;
    }
  );

  // POST /tokens - Création d'un token (MAINTAINER, ADMIN)
  fastify.post(
    '/tokens',
    {
      preHandler: requirePermission('tokens:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
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
          .send({
            error: 'No themes found. Please create at least one theme.',
          });
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
          tokenValues: {
            include: {
              theme: true,
            },
          },
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return reply.status(201).send(token);
    }
  );

  // PUT /tokens/:id - Mise à jour d'un token (MAINTAINER, ADMIN)
  fastify.put(
    '/tokens/:id',
    {
      preHandler: requirePermission('tokens:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const tokenId = parseInt(id);
      const { name, groupId } = request.body as {
        name?: string;
        groupId?: number;
      };

      try {
        const token = await prisma.token.update({
          where: { id: tokenId },
          data: { name, groupId },
          include: {
            tokenValues: {
              include: {
                theme: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        });

        return token;
      } catch (error: any) {
        if (error.code === 'P2025') {
          reply.status(404).send({ error: 'Token not found' });
        } else {
          reply.status(500).send({ error: 'Failed to update token' });
        }
      }
    }
  );

  // DELETE /tokens/:id - Suppression d'un token (MAINTAINER, ADMIN)
  fastify.delete(
    '/tokens/:id',
    {
      preHandler: requirePermission('tokens:delete'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      try {
        await prisma.token.delete({
          where: { id: parseInt(id) },
        });
        return reply.status(204).send();
      } catch (e) {
        return reply.status(404).send({ error: 'Token not found' });
      }
    }
  );
}
