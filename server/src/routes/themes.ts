import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import {
  authenticateUser,
  requirePermission,
  AuthenticatedRequest,
} from '../lib/auth';

export default async function themeRoutes(fastify: FastifyInstance) {
  // Hook d'authentification pour toutes les routes
  fastify.addHook('preHandler', authenticateUser);

  // GET /themes - Lecture des thèmes (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/themes',
    {
      preHandler: requirePermission('themes:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const themes = await prisma.theme.findMany({
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          parentId: true,
          children: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return themes;
    }
  );

  // GET /themes/:id - Lecture d'un thème spécifique (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/themes/:id',
    {
      preHandler: requirePermission('themes:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const themeId = parseInt(id);

      const theme = await prisma.theme.findUnique({
        where: { id: themeId },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          parentId: true,
          parent: {
            select: {
              id: true,
              name: true,
            },
          },
          children: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!theme) {
        reply.status(404).send({ error: 'Theme not found' });
        return;
      }

      return theme;
    }
  );

  // POST /themes - Création d'un thème (MAINTAINER, ADMIN)
  fastify.post(
    '/themes',
    {
      preHandler: requirePermission('themes:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
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
    }
  );

  // PUT /themes/:id - Mise à jour d'un thème (MAINTAINER, ADMIN)
  fastify.put(
    '/themes/:id',
    {
      preHandler: requirePermission('themes:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const themeId = parseInt(id);
      const { name, parentId } = request.body as {
        name?: string;
        parentId?: number;
      };

      try {
        const theme = await prisma.theme.update({
          where: { id: themeId },
          data: { name, parentId },
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            parentId: true,
          },
        });

        return theme;
      } catch (error: any) {
        if (error.code === 'P2025') {
          reply.status(404).send({ error: 'Theme not found' });
        } else if (error.code === 'P2002') {
          reply.status(409).send({ error: 'Theme name must be unique' });
        } else {
          reply.status(500).send({ error: 'Failed to update theme' });
        }
      }
    }
  );

  // DELETE /themes/:id - Suppression d'un thème (MAINTAINER, ADMIN)
  fastify.delete(
    '/themes/:id',
    {
      preHandler: requirePermission('themes:delete'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      try {
        await prisma.theme.delete({
          where: { id: parseInt(id) },
        });
        return reply.status(204).send();
      } catch (e) {
        return reply.status(404).send({ error: 'Theme not found' });
      }
    }
  );
}
