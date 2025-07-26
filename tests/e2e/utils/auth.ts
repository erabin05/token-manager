import { PrismaClient, UserRole } from '@prisma/client';
import { generateUniqueName } from './factories';

// Configuration Prisma partagée - utilise la configuration par défaut
export const prisma = new PrismaClient();

/**
 * Créer un utilisateur avec un rôle spécifique
 */
export async function createUserWithRole(role: UserRole) {
  return await prisma.user.create({
    data: {
      email: `${generateUniqueName('user')}@test.com`,
      name: generateUniqueName('user-name'),
      role,
    },
  });
}

/**
 * Créer plusieurs utilisateurs avec différents rôles
 */
export async function createTestUsers() {
  const viewerUser = await createUserWithRole(UserRole.VIEWER);
  const maintainerUser = await createUserWithRole(UserRole.MAINTAINER);
  const adminUser = await createUserWithRole(UserRole.ADMIN);

  return { viewerUser, maintainerUser, adminUser };
}

/**
 * Créer les headers d'authentification pour un utilisateur
 */
export function createAuthHeaders(userId: number | string) {
  return { 'x-user-id': userId.toString() };
}

/**
 * Créer les headers d'authentification pour un utilisateur avec des headers supplémentaires
 */
export function createAuthHeadersWith(
  userId: number | string,
  additionalHeaders: Record<string, string> = {}
) {
  return {
    'x-user-id': userId.toString(),
    ...additionalHeaders,
  };
}
