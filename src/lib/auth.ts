import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient, UserRole } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Types pour les permissions
export type Permission =
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'themes:read'
  | 'themes:write'
  | 'themes:delete'
  | 'tokens:read'
  | 'tokens:write'
  | 'tokens:delete'
  | 'groups:read'
  | 'groups:write'
  | 'groups:delete';

// Configuration des permissions par rôle
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.VIEWER]: [
    'users:read',
    'themes:read',
    'tokens:read',
    'groups:read',
  ],
  [UserRole.MAINTAINER]: [
    'users:read',
    'themes:read',
    'themes:write',
    'themes:delete',
    'tokens:read',
    'tokens:write',
    'tokens:delete',
    'groups:read',
    'groups:write',
    'groups:delete',
  ],
  [UserRole.ADMIN]: [
    'users:read',
    'users:write',
    'users:delete',
    'themes:read',
    'themes:write',
    'themes:delete',
    'tokens:read',
    'tokens:write',
    'tokens:delete',
    'groups:read',
    'groups:write',
    'groups:delete',
  ],
};

// Interface pour étendre FastifyRequest avec l'utilisateur
export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Hook pour extraire l'utilisateur depuis le token JWT
 */
export const authenticateUser = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
): Promise<void> => {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      reply
        .status(401)
        .send({ error: 'Authorization header with Bearer token is required' });
      return;
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key'
      ) as { userId: number; email: string; role: UserRole };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        reply.status(401).send({ error: 'User not found' });
        return;
      }

      request.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as UserRole,
      };
    } catch (jwtError) {
      reply.status(401).send({ error: 'Invalid or expired token' });
      return;
    }
  } catch (error) {
    console.error('Authentication error:', error);
    reply.status(500).send({ error: 'Authentication failed' });
  }
};

/**
 * Hook pour vérifier les permissions
 */
export const requirePermission = (permission: Permission) => {
  return async (
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ error: 'Authentication required' });
      return;
    }

    const userPermissions = rolePermissions[request.user.role];

    if (!userPermissions.includes(permission)) {
      reply.status(403).send({
        error: 'Insufficient permissions',
        required: permission,
        userRole: request.user.role,
        userPermissions,
      });
      return;
    }
  };
};

/**
 * Hook pour vérifier plusieurs permissions (toutes requises)
 */
export const requireAllPermissions = (permissions: Permission[]) => {
  return async (
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ error: 'Authentication required' });
      return;
    }

    const userPermissions = rolePermissions[request.user.role];

    const hasAllPermissions = permissions.every(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAllPermissions) {
      reply.status(403).send({
        error: 'Insufficient permissions',
        required: permissions,
        userRole: request.user.role,
        userPermissions,
      });
      return;
    }
  };
};

/**
 * Hook pour vérifier plusieurs permissions (au moins une requise)
 */
export const requireAnyPermission = (permissions: Permission[]) => {
  return async (
    request: AuthenticatedRequest,
    reply: FastifyReply
  ): Promise<void> => {
    if (!request.user) {
      reply.status(401).send({ error: 'Authentication required' });
      return;
    }

    const userPermissions = rolePermissions[request.user.role];

    const hasAnyPermission = permissions.some(permission =>
      userPermissions.includes(permission)
    );

    if (!hasAnyPermission) {
      reply.status(403).send({
        error: 'Insufficient permissions',
        required: permissions,
        userRole: request.user.role,
        userPermissions,
      });
      return;
    }
  };
};

/**
 * Utilitaires pour les permissions
 */
export const authUtils = {
  /**
   * Vérifie si un utilisateur a une permission spécifique
   */
  hasPermission: (userRole: UserRole, permission: Permission): boolean => {
    return rolePermissions[userRole].includes(permission);
  },

  /**
   * Récupère toutes les permissions d'un rôle
   */
  getRolePermissions: (role: UserRole): Permission[] => {
    return rolePermissions[role];
  },

  /**
   * Récupère tous les rôles disponibles
   */
  getAvailableRoles: (): UserRole[] => {
    return Object.values(UserRole);
  },
};
