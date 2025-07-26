import { defineConfig, devices } from '@playwright/test';

// Déterminer l'environnement de test (dev par défaut)
const testEnv = process.env.TEST_ENV || 'dev';
const composeFile =
  testEnv === 'prod' ? 'docker-compose.prod.yml' : 'docker-compose.dev.yml';
const baseURL =
  testEnv === 'prod' ? 'http://localhost:3000' : 'http://localhost:3000';

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
