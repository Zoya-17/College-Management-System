import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5000 },
  use: {
  baseURL: process.env.VITE_API_BASE || 'http://localhost:5174',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
  },
  webServer: {
  command: 'npm run dev',
  port: 5174,
  reuseExistingServer: true,
    timeout: 120_000,
  },
});
