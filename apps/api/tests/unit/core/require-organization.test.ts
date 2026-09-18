import express, { type NextFunction, type Request, type Response } from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { errorHandler } from '../../../src/core/middleware/errorHandler';
import { requireOrganization } from '../../../src/core/middleware/requirePermission';

describe('requireOrganization', () => {
  it('rejects requests whose organizationId does not match the JWT org', async () => {
    const app = express();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.user = {
        org: { id: 'org-1', code: 'DEMO', tier: 'BASIC' },
        user: { id: 'user-1', isSuperAdmin: false },
        session: { permissions: [] },
      } as Request['user'];
      next();
    });
    app.get(
      '/organizations/:organizationId/resource',
      requireOrganization('organizationId'),
      (_req, res) => {
        res.status(200).json({ ok: true });
      }
    );
    app.use(errorHandler);

    const response = await request(app)
      .get('/organizations/org-other/resource')
      .expect(403);

    expect(response.body.error.code).toBe('FORBIDDEN');
  });

  it('allows super admins to access another organization', async () => {
    const app = express();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      req.user = {
        org: { id: 'org-1', code: 'DEMO', tier: 'BASIC' },
        user: { id: 'user-1', isSuperAdmin: true },
        session: { permissions: [] },
      } as Request['user'];
      next();
    });
    app.get(
      '/organizations/:organizationId/resource',
      requireOrganization('organizationId'),
      (_req, res) => {
        res.status(200).json({ ok: true });
      }
    );
    app.use(errorHandler);

    await request(app).get('/organizations/org-other/resource').expect(200);
  });
});
