import { openAPIRouter } from '@/api-docs/openAPIRouter';
import { routes } from '@/routes/registerRoutes';
import express, { type Application, type NextFunction, type Request, type Response } from 'express';
import { logger } from './core/logger';
import {
  apiLimiter,
  auditLogMiddleware,
  corsMiddleware,
  errorHandler,
  injectionGuard,
  ipBanCheck,
  notFoundHandler,
  preventParamPollution,
  requestId,
  requestSizeLimiter,
  securityHeaders,
} from './core';

export const createApp = (): Application => {
  const app = express();

  // 1. IP ban check — reject banned IPs immediately
  app.use(ipBanCheck());

  // 2. Request ID — attach to every request
  app.use(requestId());

  // 3. Security headers
  app.use(securityHeaders());

  // 4. CORS — handle preflight
  app.use(corsMiddleware());

  // 5–6. Body parsing
  app.use(express.json({ limit: '500kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // 7. Post-parse size check
  app.use(requestSizeLimiter());

  // 8. Parameter pollution prevention
  app.use(preventParamPollution());

  // 9. Injection guard
  app.use(injectionGuard());

  // 10. Global per-user rate limit
  app.use(apiLimiter);

  // 11. Audit log middleware — intercepts responses
  app.use(auditLogMiddleware());

  // 12. Request logging (after security, before routes)
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      const duration = Date.now() - req.startTime;
      logger.info({
        requestId: req.requestId,
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userId: (req as any).user?.sub ?? null,
      });
    });
    next();
  });

  // API Documentation
  app.use('/api-docs', openAPIRouter);

  // Routes
  app.use(routes);

  // Error handling (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
