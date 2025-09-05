import { test, expect } from '@playwright/test';

test('backend register endpoint responds', async ({ request }) => {
  const email = `e2e+api+${Date.now()}@example.com`;
  const res = await request.post('http://localhost:5000/api/auth/register', { data: { email, password: 'E2Epass123!' } });
  const body = await res.json();
  // success could be true or false (email exists), but endpoint must respond with JSON
  expect(body).toBeTruthy();
  expect(typeof body).toBe('object');
});
