import crypto from 'node:crypto';
import type { Application, NextFunction, Request, RequestHandler, Response } from 'express';

// ═══════════════════════════════════════════
// A1 — Security headers middleware
// ═══════════════════════════════════════════

export function securityHeaders(): RequestHandler {
  return (_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
    res.setHeader(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "connect-src 'self'",
        "font-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
      ].join('; ')
    );

    if (process.env['NODE_ENV'] === 'production') {
      res.setHeader(
        'Strict-Transport-Security',
        'max-age=31536000; includeSubDomains'
      );
    }

    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    next();
  };
}

// ═══════════════════════════════════════════
// A2 — CORS middleware
// ═══════════════════════════════════════════

export function corsMiddleware(): RequestHandler {
  const allowedOrigins: string[] = (
    process.env['CORS_ORIGINS']?.split(',').map((o) => o.trim()) ?? []
  );

  if (process.env['NODE_ENV'] === 'development' && allowedOrigins.length === 0) {
    allowedOrigins.push('*');
  }

  const allowAll = allowedOrigins.includes('*');

  return (req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers['origin'];

    if (origin && (allowAll || allowedOrigins.includes(origin))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS'
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, X-Request-ID, X-Device-Fingerprint'
      );
      res.setHeader('Access-Control-Max-Age', '86400');
    }

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    next();
  };
}

// ═══════════════════════════════════════════
// A3 — Request size limiter
// ═══════════════════════════════════════════

function parseBytes(value: string): number {
  const match = value.match(/^(\d+)(kb|mb|b)?$/i);
  if (!match) return 500 * 1024;
  const num = Number(match[1]);
  const unit = (match[2] ?? 'b').toLowerCase();
  if (unit === 'kb') return num * 1024;
  if (unit === 'mb') return num * 1024 * 1024;
  return num;
}

export function requestSizeLimiter(): RequestHandler {
  const maxJsonBytes = parseBytes(process.env['MAX_JSON_SIZE'] ?? '500kb');
  const maxUrlBytes = parseBytes(process.env['MAX_URL_SIZE'] ?? '100kb');

  return (req: Request, res: Response, next: NextFunction) => {
    const contentLength = parseInt(req.headers['content-length'] ?? '0', 10);
    const contentType = (req.headers['content-type'] ?? '').toLowerCase();

    if (contentType.includes('application/x-java-serialized')) {
      res.status(415).json({ error: 'Unsupported Media Type', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }

    if (contentType.includes('text/xml') && contentType.includes('doctype')) {
      res.status(415).json({ error: 'Unsupported Media Type', code: 'UNSUPPORTED_MEDIA_TYPE' });
      return;
    }

    if (contentLength > 0) {
      if (contentType.includes('application/json') && contentLength > maxJsonBytes) {
        res.status(413).json({ error: 'Request body too large', code: 'PAYLOAD_TOO_LARGE' });
        return;
      }

      if (contentType.includes('application/x-www-form-urlencoded') && contentLength > maxUrlBytes) {
        res.status(413).json({ error: 'Request body too large', code: 'PAYLOAD_TOO_LARGE' });
        return;
      }
    }

    next();
  };
}

// ═══════════════════════════════════════════
// A4 — Request ID middleware
// ═══════════════════════════════════════════

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
    }
  }
}

export function requestId(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers['x-request-id'] as string | undefined;
    let id: string;

    if (header && header.length <= 64 && UUID_REGEX.test(header)) {
      id = header;
    } else {
      id = crypto.randomUUID();
    }

    req.requestId = id;
    req.startTime = Date.now();
    res.setHeader('X-Request-ID', id);

    next();
  };
}

// ═══════════════════════════════════════════
// A5 — Parameter pollution prevention
// ═══════════════════════════════════════════

const ALLOWED_ARRAY_PARAMS = new Set([
  'status',
  'itemTypes',
  'channelIds',
  'roomTypeIds',
]);

export function preventParamPollution(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const [key, value] of Object.entries(req.query)) {
      if (Array.isArray(value) && !ALLOWED_ARRAY_PARAMS.has(key)) {
        const arr = value as string[];
        req.query[key] = arr[arr.length - 1];
      }
    }
    next();
  };
}

// ═══════════════════════════════════════════
// A6 — NoSQL / SQL injection guard
// ═══════════════════════════════════════════

const INJECTION_PATTERNS = /(--|\/\*|\*\/|xp_|EXEC\s*\(|EXECUTE\s*\(|<script|javascript:)/i;

function scanValue(value: unknown, path: string[]): string | null {
  if (typeof value === 'string') {
    if (INJECTION_PATTERNS.test(value)) return path.join('.');
    return null;
  }

  if (value && typeof value === 'object') {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const result = scanValue(value[i], [...path, `[${i}]`]);
        if (result) return result;
      }
      return null;
    }

    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (key.startsWith('$')) return [...path, key].join('.');
      const result = scanValue(val, [...path, key]);
      if (result) return result;
    }
  }

  return null;
}

export function injectionGuard(): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const targets: Record<string, unknown>[] = [
      ...(Array.isArray(req.body) ? req.body : [req.body]),
      req.query as Record<string, unknown>,
      req.params as Record<string, unknown>,
    ];

    for (const target of targets) {
      const found = scanValue(target, []);
      if (found) {
        console.warn(
          `[Security] Injection pattern blocked — requestId=${req.requestId}, path=${req.path}, method=${req.method}, param=${found}`
        );
        res.status(400).json({
          error: 'Invalid input detected',
          code: 'INJECTION_GUARD',
        });
        return;
      }
    }

    next();
  };
}

// ═══════════════════════════════════════════
// Composed middleware mount function
// ═══════════════════════════════════════════

export function applySecurityMiddleware(app: Application) {
  app.use(requestId());
  app.use(securityHeaders());
  app.use(corsMiddleware());
  app.use(preventParamPollution());
  app.use(injectionGuard());
}
