/**
 * Jest global setup — runs before the test framework and any module import.
 * `src/config/env.ts` validates process.env with Zod and calls process.exit(1)
 * when a required variable is missing, so defaults must exist before it loads.
 */
process.env['NODE_ENV'] = 'test';
process.env['DATABASE_URL'] ??= 'postgresql://test:test@localhost:5432/test';
process.env['JWT_ACCESS_SECRET'] ??= 'test-access-secret-at-least-32-chars-long';
process.env['JWT_REFRESH_SECRET'] ??= 'test-refresh-secret-at-least-32-chars-long';
process.env['CLOUDINARY_CLOUD_NAME'] ??= 'test';
process.env['CLOUDINARY_API_KEY'] ??= 'test';
process.env['CLOUDINARY_API_SECRET'] ??= 'test';
process.env['COOKIE_SECRET'] ??= 'test-cookie-secret-at-least-32-chars-long';
process.env['CORS_ORIGINS'] ??= 'http://localhost:3000,https://portal.example.edu';
