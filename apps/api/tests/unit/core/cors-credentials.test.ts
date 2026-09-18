import express from 'express';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { corsMiddleware } from '../../../src/core/middleware/security';

describe('corsMiddleware credentials', () => {
  const originalOrigins = process.env['CORS_ORIGINS'];
  const originalOrigin = process.env['CORS_ORIGIN'];
  const originalNodeEnv = process.env['NODE_ENV'];

  afterEach(() => {
    if (originalOrigins === undefined) {
      process.env['CORS_ORIGINS'] = undefined;
    } else {
      process.env['CORS_ORIGINS'] = originalOrigins;
    }
    if (originalOrigin === undefined) {
      process.env['CORS_ORIGIN'] = undefined;
    } else {
      process.env['CORS_ORIGIN'] = originalOrigin;
    }
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('does not allow arbitrary origins with credentials when CORS is unset', async () => {
    process.env['CORS_ORIGINS'] = undefined;
    process.env['CORS_ORIGIN'] = undefined;
    process.env['NODE_ENV'] = 'development';

    const app = express();
    app.use(corsMiddleware());
    app.get('/ping', (_req, res) => {
      res.status(200).json({ ok: true });
    });

    const response = await request(app).get('/ping').set('Origin', 'https://evil.example');

    expect(response.headers['access-control-allow-origin']).not.toBe('https://evil.example');
    expect(response.headers['access-control-allow-credentials']).not.toBe('true');
  });
});
