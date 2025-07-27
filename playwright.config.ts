import { defineConfig, devices } from '@playwright/test';

// Déterminer l'environnement de test (dev par défaut)
const testEnv = process.env.TEST_ENV || 'dev';
const composeFile =
  testEnv === 'prod' ? 'docker-compose.prod.yml' : 'docker-compose.dev.yml';

// Utiliser la variable d'environnement BASE_URL si fournie, sinon utiliser les URLs par défaut
const baseURL =
  process.env.BASE_URL ||
  (testEnv === 'prod'
    ? 'http://localhost:3000'
    : 'http://token-manager.server.localhost');

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Exécution séquentielle des tests
  // Separate test results from HTML report to avoid conflicts
  outputDir: 'playwright-output/test-results',
  reporter: [['html', { outputFolder: 'playwright-output/reports' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `./scripts/switch-env.sh ${testEnv}`,
    url: `${baseURL}/health`,
    reuseExistingServer: true, // Réutilisation si l'environnement est déjà actif
    timeout: 300 * 1000,
  },
});
