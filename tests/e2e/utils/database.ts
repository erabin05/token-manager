import { prisma } from './auth';

// Variables d'environnement pour l'utilisateur admin
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@token-manager.com';

/**
 * Nettoyer la base de données en respectant les dépendances
 * Préserve l'utilisateur admin du seed
 */
export async function cleanupDatabase() {
  await prisma.tokenValue.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tokenGroup.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        not: ADMIN_EMAIL,
      },
    },
  });
  await prisma.theme.deleteMany();
}

/**
 * Nettoyer la base de données sauf les thèmes (pour les tests qui en ont besoin)
 * Préserve l'utilisateur admin du seed
 */
export async function cleanupDatabaseExceptThemes() {
  await prisma.tokenValue.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tokenGroup.deleteMany();
  await prisma.user.deleteMany({
    where: {
      email: {
        not: ADMIN_EMAIL,
      },
    },
  });
  // Ne pas supprimer les thèmes - chaque test créera ceux dont il a besoin
}

/**
 * Nettoyer uniquement les données liées aux tokens
 */
export async function cleanupTokenData() {
  await prisma.tokenValue.deleteMany();
  await prisma.token.deleteMany();
}

/**
 * Nettoyer uniquement les données liées aux groupes
 */
export async function cleanupGroupData() {
  await prisma.tokenValue.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tokenGroup.deleteMany();
}

/**
 * Nettoyer uniquement les utilisateurs (sauf admin)
 */
export async function cleanupUserData() {
  await prisma.user.deleteMany({
    where: {
      email: {
        not: ADMIN_EMAIL,
      },
    },
  });
}
