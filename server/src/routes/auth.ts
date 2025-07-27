import { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';
import {
  authenticateUser,
  AuthenticatedRequest,
  requirePermission,
} from '../lib/auth';

// Types pour les requêtes
interface LoginRequest {
  email: string;
  password: string;
}

interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export default async function authRoutes(fastify: FastifyInstance) {
  // POST /auth/login - Connexion utilisateur
  fastify.post<{ Body: LoginRequest }>(
    '/auth/login',
    async (request, reply) => {
      const { email, password } = request.body;

      // Validation
      if (!email || !password) {
        return reply.status(400).send({
          error: 'Email and password are required',
        });
      }

      try {
        // Trouver l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return reply.status(401).send({
            error: 'Invalid email or password',
          });
        }

        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          return reply.status(401).send({
            error: 'Invalid email or password',
          });
        }

        // Générer les tokens
        const accessToken = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            role: user.role,
          },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '15m' }
        );

        const refreshToken = jwt.sign(
          {
            userId: user.id,
            type: 'refresh',
          },
          process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
          { expiresIn: '7d' }
        );

        // Sauvegarder le refresh token
        await prisma.user.update({
          where: { id: user.id },
          data: { refreshToken },
        });

        // Retourner les tokens et les informations utilisateur
        return reply.send({
          message: 'Login successful',
          accessToken,
          refreshToken,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
        });
      } catch (error) {
        console.error('Login error:', error);
        return reply.status(500).send({
          error: 'Login failed',
        });
      }
    }
  );

  // POST /auth/refresh - Rafraîchir le token d'accès
  fastify.post('/auth/refresh', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshToken) {
      return reply.status(400).send({
        error: 'Refresh token is required',
      });
    }

    try {
      // Vérifier le refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key'
      ) as { userId: number; type: string };

      if (decoded.type !== 'refresh') {
        return reply.status(401).send({
          error: 'Invalid refresh token',
        });
      }

      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.refreshToken !== refreshToken) {
        return reply.status(401).send({
          error: 'Invalid refresh token',
        });
      }

      // Générer un nouveau access token
      const newAccessToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '15m' }
      );

      return reply.send({
        accessToken: newAccessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      return reply.status(401).send({
        error: 'Invalid refresh token',
      });
    }
  });

  // POST /auth/logout - Déconnexion utilisateur
  fastify.post('/auth/logout', async (request, reply) => {
    const { refreshToken } = request.body as { refreshToken: string };

    if (!refreshToken) {
      return reply.status(400).send({
        error: 'Refresh token is required',
      });
    }

    try {
      // Supprimer le refresh token de la base de données
      await prisma.user.updateMany({
        where: { refreshToken },
        data: { refreshToken: null },
      });

      return reply.send({
        message: 'Logout successful',
      });
    } catch (error) {
      console.error('Logout error:', error);
      return reply.status(500).send({
        error: 'Logout failed',
      });
    }
  });

  // GET /auth/me - Récupérer les informations de l'utilisateur connecté
  fastify.get(
    '/auth/me',
    {
      preHandler: authenticateUser,
    },
    async (request: AuthenticatedRequest, reply) => {
      try {
        const user = await prisma.user.findUnique({
          where: { id: request.user!.id },
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
          return reply.status(404).send({
            error: 'User not found',
          });
        }

        return reply.send(user);
      } catch (error) {
        console.error('Get user error:', error);
        return reply.status(500).send({
          error: 'Failed to get user information',
        });
      }
    }
  );
}
