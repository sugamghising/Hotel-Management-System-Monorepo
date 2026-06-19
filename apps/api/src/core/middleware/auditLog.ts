import type { NextFunction, Request, Response } from 'express';
import { AuditService, auditService } from '../services/audit.service';

const SKIP_PATHS = [
  '/health', '/api-docs',
  '/auth/login', '/auth/refresh', '/auth/logout',
];

function shouldSkip(method: string, path: string): boolean {
  if (method === 'GET' || method === 'HEAD') return true;
  const relative = path.replace(/^\/api\/v\d+/, '') || path;
  return SKIP_PATHS.some((s) => relative.startsWith(s));
}

function deriveAction(method: string, path: string): string {
  const relative = path.replace(/^\/api\/v\d+/, '') || path;

  const actionMap: Record<string, string> = {
    'POST /auth/login': 'AUTH_LOGIN',
    'POST /users': 'USER_CREATE',
    'PATCH /users': 'USER_UPDATE',
    'DELETE /users': 'USER_DELETE',
    'POST /users/{id}/activate': 'USER_ACTIVATE',
    'POST /users/{id}/roles': 'ROLE_ASSIGN',
    'POST /hotels': 'HOTEL_CREATE',
    'PATCH /hotels': 'HOTEL_UPDATE',
    'DELETE /hotels': 'HOTEL_DELETE',
    'POST /reservations': 'RESERVATION_CREATE',
    'PATCH /reservations': 'RESERVATION_UPDATE',
    'POST /reservations/{id}/cancel': 'RESERVATION_CANCEL',
    'POST /reservations/{id}/check-in': 'RESERVATION_CHECK_IN',
    'POST /reservations/{id}/check-out': 'RESERVATION_CHECK_OUT',
    'POST /reservations/{id}/no-show': 'RESERVATION_NO_SHOW',
    'POST /folio/charges': 'FOLIO_CHARGE',
    'POST /folio/charges/{id}/void': 'FOLIO_VOID',
    'POST /payments': 'PAYMENT_CREATE',
    'POST /payments/{id}/refund': 'PAYMENT_REFUND',
    'POST /payments/{id}/void': 'PAYMENT_VOID',
    'POST /invoices/{id}/void': 'INVOICE_VOID',
    'POST /night-audit/start': 'NIGHT_AUDIT_RUN',
    'POST /night-audit/rollback': 'NIGHT_AUDIT_ROLLBACK',
    'POST /rate-plans': 'RATE_PLAN_CREATE',
    'PATCH /rate-plans': 'RATE_PLAN_UPDATE',
    'DELETE /rate-plans': 'RATE_PLAN_DELETE',
    'POST /rooms/{id}/ooo': 'ROOM_OOO_SET',
    'DELETE /rooms/{id}/ooo': 'ROOM_OOO_REMOVE',
    'POST /channels': 'CHANNEL_CONNECT',
    'DELETE /channels': 'CHANNEL_DISCONNECT',
  };

  const exactKey = `${method} ${relative}`;
  if (actionMap[exactKey]) return actionMap[exactKey];

  const normalized = relative
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/{id}')
    .replace(/\/[A-Za-z0-9-_]+/g, (match) => {
      if (/^\/(hotels|organizations|guests|users|rooms|folio|payments|invoices|channels|communications|housekeeping|maintenance|inventory|pos|night-audit|rate-plans|reservations|reports|auth)$/i.test(match)) return match;
      return '/{id}';
    });

  const normalizedKey = `${method} ${normalized}`;
  if (actionMap[normalizedKey]) return actionMap[normalizedKey];

  const segment = relative.split('/').filter(Boolean).pop() ?? 'UNKNOWN';
  return `${method}_${segment.toUpperCase()}`;
}

function deriveResourceType(path: string): string {
  const relative = path.replace(/^\/api\/v\d+/, '') || path;
  const segments = relative.split('/').filter(Boolean).filter(
    (s) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
  );
  const meaningful = segments[segments.length - 1] ?? 'UNKNOWN';
  return meaningful.replace(/-/g, '_').toUpperCase();
}

function extractResourceId(path: string): string | undefined {
  const uuidMatch = path.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi
  );
  return uuidMatch?.[uuidMatch.length - 1];
}

export function auditLogMiddleware(): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (shouldSkip(req.method, req.path)) {
      next();
      return;
    }

    const originalJson = res.json.bind(res);
    res.json = function (body: any) {
      res.locals['responseBody'] = body;
      return originalJson(body);
    };

    res.on('finish', () => {
      if (res.statusCode >= 400) return;

      const action = deriveAction(req.method, req.path);
      const resourceType = deriveResourceType(req.path);
      const resourceId = extractResourceId(req.path) ?? undefined;

      const responseBody = res.locals['responseBody'] as Record<string, any> | undefined;

      const entry: Record<string, any> = {
        action,
        resourceType,
        resourceId,
        organizationId: (req as any).user?.org?.id ?? 'UNKNOWN',
        userId: (req as any).user?.sub,
        userEmail: (req as any).user?.user?.email,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        riskLevel: AuditService.riskLevel(action),
      };

      if (responseBody?.['data']) {
        entry['changes'] = { after: responseBody['data'] };
      }

      if (responseBody?.['data']?.['id']) {
        entry['resourceId'] = responseBody['data']['id'];
      }

      auditService.logAsync(entry as any);
    });

    next();
  };
}
