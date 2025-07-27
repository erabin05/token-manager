import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
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
          createdAt: true,
          updatedAt: true,
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
          createdAt: true,
          updatedAt: true,
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
        password,
        role = UserRole.VIEWER,
      } = request.body as {
        email: string;
        name: string;
        password: string;
        role?: UserRole;
      };

      // Validation
      if (!email || !name || !password) {
        reply
          .status(400)
          .send({ error: 'Email, name and password are required' });
        return;
      }

      if (password.length < 6) {
        reply
          .status(400)
          .send({ error: 'Password must be at least 6 characters long' });
        return;
      }

      try {
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            role,
          },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
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
      const { email, name, password, role } = request.body as {
        email?: string;
        name?: string;
        password?: string;
        role?: UserRole;
      };

      try {
        const updateData: any = {};

        if (email !== undefined) updateData.email = email;
        if (name !== undefined) updateData.name = name;
        if (role !== undefined) updateData.role = role;

        // Si un nouveau mot de passe est fourni, le hasher
        if (password !== undefined) {
          if (password.length < 6) {
            reply
              .status(400)
              .send({ error: 'Password must be at least 6 characters long' });
            return;
          }
          updateData.password = await bcrypt.hash(password, 12);
        }

        const user = await prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            createdAt: true,
            updatedAt: true,
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
