import { defineConfig, devices } from '@playwright/test';

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
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'docker-compose -f docker-compose.test.yml up --build -d',
    url: 'http://localhost:3001/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
