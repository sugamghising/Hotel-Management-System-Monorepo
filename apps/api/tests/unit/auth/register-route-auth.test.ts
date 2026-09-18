import express, { type Application } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { errorHandler } from '../../../src/core/middleware/errorHandler';

vi.mock('../../../src/database/prisma', () => ({
  prisma: {},
}));

vi.mock('../../../src/api/auth/auth.service', () => ({
  authService: {
    register: vi.fn(),
  },
}));

import authRoutes from '../../../src/api/auth/auth.routes';

describe('Auth Routes - register requires authentication', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/v1/auth', authRoutes);
    app.use(errorHandler);
  });

  it('returns 401 when POST /api/v1/auth/register has no token', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        organizationId: '00000000-0000-0000-0000-000000000001',
        email: 'new@example.com',
        password: 'ValidPass123!@#',
        firstName: 'New',
        lastName: 'User',
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('UNAUTHORIZED');
  });
});
