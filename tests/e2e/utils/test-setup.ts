import { test as base } from '@playwright/test';
import { loginAsAdmin, AuthInfo, ensureAdminUserExists } from './auth';
import { cleanupDatabase } from './database';

// Extension du type de test pour inclure l'authentification
export interface TestFixtures {
  authInfo: AuthInfo;
}

// Configuration de base pour tous les tests
export const test = base.extend<TestFixtures>({
  authInfo: async ({ request }, use) => {
    // S'assurer que l'utilisateur admin existe
    await ensureAdminUserExists();

    // Se connecter avec l'utilisateur admin
    const authInfo = await loginAsAdmin(request);

    // Passer les informations d'authentification au test
    await use(authInfo);
  },
});

// Configuration pour les tests qui ont besoin de nettoyer la base de données
export const testWithCleanup = test.extend({
  authInfo: async ({ request }, use) => {
    // Nettoyer la base de données avant chaque test
    await cleanupDatabase();

    // S'assurer que l'utilisateur admin existe
    await ensureAdminUserExists();

    // Se connecter avec l'utilisateur admin
    const authInfo = await loginAsAdmin(request);

    // Passer les informations d'authentification au test
    await use(authInfo);
  },
});

export { expect } from '@playwright/test';
