import { FastifyInstance } from 'fastify';
import prisma from '../lib/prisma';
import {
  authenticateUser,
  requirePermission,
  AuthenticatedRequest,
} from '../lib/auth';
import { UserRole } from '@prisma/client';

export default async function userRoutes(fastify: FastifyInstance) {
  // Hook d'authentification pour toutes les routes
  fastify.addHook('preHandler', authenticateUser);

  // GET /users - Lecture des utilisateurs (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/users',
    {
      preHandler: requirePermission('users:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });
      return users;
    }
  );

  // GET /users/:id - Lecture d'un utilisateur spécifique (VIEWER, MAINTAINER, ADMIN)
  fastify.get(
    '/users/:id',
    {
      preHandler: requirePermission('users:read'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const userId = parseInt(id);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        reply.status(404).send({ error: 'User not found' });
        return;
      }

      return user;
    }
  );

  // POST /users - Création d'utilisateur (ADMIN seulement)
  fastify.post(
    '/users',
    {
      preHandler: requirePermission('users:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const {
        email,
        name,
        role = UserRole.VIEWER,
      } = request.body as {
        email: string;
        name: string;
        role?: UserRole;
      };

      // Validation
      if (!email || !name) {
        reply.status(400).send({ error: 'Email and name are required' });
        return;
      }

      try {
        const user = await prisma.user.create({
          data: { email, name, role },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });

        reply.status(201).send(user);
      } catch (error: any) {
        if (error.code === 'P2002') {
          reply
            .status(409)
            .send({ error: 'User with this email already exists' });
        } else {
          reply.status(500).send({ error: 'Failed to create user' });
        }
      }
    }
  );

  // PUT /users/:id - Mise à jour d'utilisateur (ADMIN seulement)
  fastify.put(
    '/users/:id',
    {
      preHandler: requirePermission('users:write'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const userId = parseInt(id);
      const { email, name, role } = request.body as {
        email?: string;
        name?: string;
        role?: UserRole;
      };

      try {
        const user = await prisma.user.update({
          where: { id: userId },
          data: { email, name, role },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
          },
        });

        return user;
      } catch (error: any) {
        if (error.code === 'P2025') {
          reply.status(404).send({ error: 'User not found' });
        } else if (error.code === 'P2002') {
          reply
            .status(409)
            .send({ error: 'User with this email already exists' });
        } else {
          reply.status(500).send({ error: 'Failed to update user' });
        }
      }
    }
  );

  // DELETE /users/:id - Suppression d'utilisateur (ADMIN seulement)
  fastify.delete(
    '/users/:id',
    {
      preHandler: requirePermission('users:delete'),
    },
    async (request: AuthenticatedRequest, reply) => {
      const { id } = request.params as { id: string };
      const userId = parseInt(id);

      try {
        await prisma.user.delete({
          where: { id: userId },
        });

        reply.status(204).send();
      } catch (error: any) {
        if (error.code === 'P2025') {
          reply.status(404).send({ error: 'User not found' });
        } else {
          reply.status(500).send({ error: 'Failed to delete user' });
        }
      }
    }
  );
}
