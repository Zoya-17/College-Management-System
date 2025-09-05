Frontend for CMIS

Set VITE_API_BASE to point to backend (e.g. http://127.0.0.1:5000)

End-to-end tests with Playwright:

1. Install Playwright:

```
cd Frontend
npm i -D @playwright/test
npx playwright install
```

2. Run tests:

```
npx playwright test
```

Notes:
- The frontend will auto-refresh access tokens when a refresh token exists in localStorage as `cmis_refresh`.
- Admin routes are protected client-side using `AdminRoute` which redirects non-admins.
