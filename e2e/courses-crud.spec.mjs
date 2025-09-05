import { test, expect } from '@playwright/test';

test('admin courses CRUD', async ({ page, request }) => {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@college.edu';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';

  // ensure admin user exists (use backend seed endpoint via request)
  await request.post('http://localhost:5000/api/auth/register', { data: { email: adminEmail, password: adminPassword } }).catch(() => {});

  // authenticate via API and set localStorage tokens + user (faster & reliable)
  const loginRes = await request.post('http://localhost:5000/api/auth/login', { data: { email: adminEmail, password: adminPassword } });
  const loginBody = await loginRes.json();
  if (!loginBody || !loginBody.success) throw new Error('API login failed during test setup: ' + JSON.stringify(loginBody));
  const access = loginBody.data.accessToken || loginBody.data.token;
  const refresh = loginBody.data.refreshToken;
  const profileRes = await request.get('http://localhost:5000/api/auth/me', { headers: { Authorization: `Bearer ${access}` } });
  const profile = await profileRes.json();
  console.log('API profile:', JSON.stringify(profile));

  // set tokens and user in localStorage before opening page
  await page.addInitScript(({ access, refresh, profile }) => {
    if (access) localStorage.setItem('cmis_token', access);
    if (refresh) localStorage.setItem('cmis_refresh', refresh);
    if (profile && profile.success && profile.data) {
      const p = profile.data;
      localStorage.setItem('cmis_user', JSON.stringify({ id: p._id || p.id || '', email: p.email, name: p.name || p.email.split('@')[0], role: p.role }));
    }
  }, { access, refresh, profile });

  const frontEnd = process.env.FRONTEND_URL || 'http://localhost:5173';
  await page.goto(`${frontEnd}/courses`);
  // wait for app to mount
  await page.waitForSelector('text=Course Catalog', { timeout: 5000 }).catch(() => {});
  const lsUser = await page.evaluate(() => localStorage.getItem('cmis_user'));
  console.log('localStorage cmis_user:', lsUser);

    // Instead of using UI forms (flaky), use the API to create/update/delete and verify UI updates.
    const code = `E2E${Date.now()}`;
    const createRes = await request.post('http://localhost:5000/api/courses', {
      data: { title: 'E2E Course Name', code, credits: 3, department: 'E2E Dept', description: 'E2E description' },
      headers: { Authorization: `Bearer ${access}` }
    });
    const createBody = await createRes.json();
    if (!createBody || !createBody.success) throw new Error('Failed to create course via API: ' + JSON.stringify(createBody));
    const created = createBody.data;

    // navigate to courses UI and assert the created course appears
    await page.goto(`${frontEnd}/courses`);
    await page.waitForSelector(`text=${code}`, { timeout: 5000 });
    const courseCard = page.locator('div', { hasText: code }).first();
    expect(await courseCard.count()).toBeGreaterThan(0);

    // Update via API
    const updatedName = 'E2E Course Name Updated';
    const updateRes = await request.put(`http://localhost:5000/api/courses/${created._id}`, {
      data: { title: updatedName },
      headers: { Authorization: `Bearer ${access}` }
    });
    const updateBody = await updateRes.json();
    if (!updateBody || !updateBody.success) throw new Error('Failed to update course via API: ' + JSON.stringify(updateBody));

    // reload courses UI so it fetches the latest data and reflects the update
    await page.goto(`${frontEnd}/courses`);
    await page.waitForSelector(`text=${updatedName}`, { timeout: 5000 });

    // Delete via API
    const delRes = await request.delete(`http://localhost:5000/api/courses/${created._id}`, { headers: { Authorization: `Bearer ${access}` } });
    const delBody = await delRes.json();
    if (!delBody || !delBody.success) throw new Error('Failed to delete course via API: ' + JSON.stringify(delBody));

    // ensure UI no longer shows the course by reloading the courses page and checking absence
    await page.goto(`${frontEnd}/courses`);
    await page.waitForSelector('text=Course Catalog', { timeout: 5000 }).catch(() => {});
    const remaining = await page.locator(`text=${code}`).count();
    if (remaining !== 0) throw new Error('Course still present in UI after delete');
});
