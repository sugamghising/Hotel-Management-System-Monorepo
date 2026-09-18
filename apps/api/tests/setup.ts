import { afterAll, beforeAll } from 'vitest';

process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DATABASE_URL ??= 'postgresql://hms_user:hms_password@localhost:5432/hms_test';
process.env.JWT_ACCESS_SECRET ??= 'test-jwt-access-secret-at-least-32-chars';
process.env.JWT_REFRESH_SECRET ??= 'test-jwt-refresh-secret-at-least-32-ch';
process.env.ENCRYPTION_KEY ??= 'test-encryption-key-at-least-32-chars';

beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global cleanup after all tests
});
