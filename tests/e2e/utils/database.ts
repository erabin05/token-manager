import { prisma } from './auth';

/**
 * Nettoyer la base de données en respectant les dépendances
 */
export async function cleanupDatabase() {
  await prisma.tokenValue.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tokenGroup.deleteMany();
  await prisma.user.deleteMany();
  await prisma.theme.deleteMany();
}

/**
 * Nettoyer la base de données sauf les thèmes (pour les tests qui en ont besoin)
 */
export async function cleanupDatabaseExceptThemes() {
  await prisma.tokenValue.deleteMany();
  await prisma.token.deleteMany();
  await prisma.tokenGroup.deleteMany();
  await prisma.user.deleteMany();
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
 * Nettoyer uniquement les utilisateurs
 */
export async function cleanupUserData() {
  await prisma.user.deleteMany();
}
