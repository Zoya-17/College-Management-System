# CMIS Backend

Express + MongoDB backend for College Management System.

Create a `.env` file with:

- MONGO_URI=
- JWT_SECRET=
- PORT=5000

Important endpoints:

- POST /api/auth/register { email, password } => { success }
- POST /api/auth/login { email, password } => { success, data: { accessToken, refreshToken } }
- GET /api/auth/me (protected) => { success, data: { email, role, ... } }
- POST /api/auth/refresh { refreshToken } => { success, data: { accessToken } }
- POST /api/auth/logout (protected) => blacklists current access token and clears refresh token

Run:

npm install
npm run dev

Notes:
- For tests, set MONGO_URI_TEST to a separate test database and run `npm test`.
- Token blacklist is stored in collection `tokenblacklists` and is simple; in production consider a more robust revocation strategy.
