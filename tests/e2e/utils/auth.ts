import { PrismaClient, UserRole } from '@prisma/client';
import { generateUniqueName } from './factories';
import bcrypt from 'bcrypt';

// Configuration Prisma partagée - utilise la configuration par défaut
export const prisma = new PrismaClient();

// Variables d'environnement pour l'utilisateur admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@token-manager.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * Interface pour les informations d'authentification
 */
export interface AuthInfo {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: UserRole;
  };
}

/**
 * Se connecter avec l'utilisateur admin du seed
 */
export async function loginAsAdmin(request: any): Promise<AuthInfo> {
  const response = await request.post('/auth/login', {
    data: {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    },
  });

  if (response.status() !== 200) {
    throw new Error(
      `Login failed: ${response.status()} - ${await response.text()}`
    );
  }

  return await response.json();
}

/**
 * Créer un utilisateur avec un rôle spécifique
 */
export async function createUserWithRole(role: UserRole) {
  const hashedPassword = await bcrypt.hash('password123', 12);

  return await prisma.user.create({
    data: {
      email: `${generateUniqueName('user')}@test.com`,
      name: generateUniqueName('user-name'),
      password: hashedPassword,
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
 * Créer les headers d'authentification avec JWT
 */
export function createAuthHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

/**
 * Créer les headers d'authentification avec JWT et des headers supplémentaires
 */
export function createAuthHeadersWith(
  accessToken: string,
  additionalHeaders: Record<string, string> = {}
) {
  return {
    Authorization: `Bearer ${accessToken}`,
    ...additionalHeaders,
  };
}

/**
 * Obtenir l'utilisateur admin depuis la base de données
 */
export async function getAdminUser() {
  return await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });
}

/**
 * Vérifier si l'utilisateur admin existe, sinon le créer
 */
export async function ensureAdminUserExists() {
  let adminUser = await getAdminUser();

  if (!adminUser) {
    const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
    adminUser = await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: process.env.ADMIN_NAME || 'System Administrator',
        password: adminPasswordHash,
        role: UserRole.ADMIN,
      },
    });
  }

  return adminUser;
}
