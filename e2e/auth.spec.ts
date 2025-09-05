import { test, expect } from '@playwright/test';

test('register and login flow', async ({ page }) => {
  await page.goto('/');
  await page.click('text=Register');
  await page.fill('input[name="email"]', `e2e+${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'E2Epass123!');
  await page.fill('input[name="confirmPassword"]', 'E2Epass123!');
  await page.click('text=Create Account');
  await page.waitForURL('**/login');
  await page.fill('input[name="email"]', `e2e+${Date.now()}@example.com`);
  await page.fill('input[name="password"]', 'E2Epass123!');
  await page.click('text=Sign In');
  await expect(page.locator('text=Logout')).toBeVisible();
});
