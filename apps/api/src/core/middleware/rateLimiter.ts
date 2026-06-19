import type { NextFunction, Request, RequestHandler, Response } from 'express';

// ═══════════════════════════════════════════
// In-memory store
// ═══════════════════════════════════════════

interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: Date }>;
  reset(key: string): Promise<void>;
}

class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();
  private cleanupTimer: ReturnType<typeof setInterval>;

  constructor() {
    this.cleanupTimer = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    this.cleanupTimer.unref();
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetAt: Date }> {
    const now = Date.now();
    const entry = this.store.get(key);
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return { count: 1, resetAt: new Date(now + windowMs) };
    }
    entry.count++;
    return { count: entry.count, resetAt: new Date(entry.resetAt) };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) this.store.delete(key);
    }
  }

  destroy() {
    clearInterval(this.cleanupTimer);
    this.store.clear();
  }
}

const store = new InMemoryRateLimitStore();

// ═══════════════════════════════════════════
// Rate limit options
// ═══════════════════════════════════════════

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
  skipIf?: (req: Request) => boolean;
  message?: string;
  skipInTests?: boolean;
}

function defaultKeyGenerator(req: Request): string {
  if ((req as any).user?.sub) {
    return `user:${(req as any).user.sub}:${req.path}`;
  }
  return `ip:${req.ip}:${req.path}`;
}

// ═══════════════════════════════════════════
// Generic rate limiter factory
// ═══════════════════════════════════════════

export function rateLimiter(options: RateLimitOptions): RequestHandler {
  const windowMs = options.windowMs;
  const max = options.max;
  const keyGen = options.keyGenerator ?? defaultKeyGenerator;
  const skip = options.skipIf ?? (() => false);
  const message = options.message ?? 'Too many requests, please try again later.';
  const skipInTests = options.skipInTests ?? true;

  return async (req: Request, res: Response, next: NextFunction) => {
    if ((skipInTests && process.env['NODE_ENV'] === 'test') || skip(req)) {
      next();
      return;
    }

    const key = keyGen(req);
    const { count, resetAt } = await store.increment(key, windowMs);

    const remaining = Math.max(0, max - count);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetAt.toISOString());

    if (count > max) {
      const retryAfterSeconds = Math.ceil((resetAt.getTime() - Date.now()) / 1000);
      res.setHeader('Retry-After', retryAfterSeconds);
      res.status(429).json({
        error: message,
        code: 'RATE_LIMITED',
        retryAfter: retryAfterSeconds,
        message,
      });
      return;
    }

    next();
  };
}

// ═══════════════════════════════════════════
// Pre-configured limiters
// ═══════════════════════════════════════════

export const loginLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyGenerator: (req) => `login:${req.ip}:${(req.body as any)?.email ?? ''}`,
  message: 'Too many login attempts. Please wait 15 minutes.',
});

export const passwordResetLimiter = rateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => `pwreset:${req.ip}`,
  message: 'Too many password reset attempts.',
});

export const apiLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  skipIf: (req) => (req as any).user?.user?.isSuperAdmin === true,
});

export const heavyLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Rate limit exceeded for this operation.',
});

export const writeLimiter = rateLimiter({
  windowMs: 60 * 1000,
  max: 60,
});

// ═══════════════════════════════════════════
// Backward-compatible factory
// ═══════════════════════════════════════════

export function createRateLimiter(opts?: {
  windowMs?: number;
  max?: number;
  message?: string;
  skipInTests?: boolean;
}): RequestHandler {
  const windowMs = opts?.windowMs ?? 15 * 60 * 1000;
  const max = opts?.max ?? 100;
  const message = opts?.message ?? 'Too many requests, please try again later';

  const options: RateLimitOptions = { windowMs, max, message };
  if (opts?.skipInTests !== undefined) options.skipInTests = opts.skipInTests;
  return rateLimiter(options);
}

// ═══════════════════════════════════════════
// IP ban check
// ═══════════════════════════════════════════

function ipInCidr(ip: string, cidr: string): boolean {
  if (!cidr.includes('/')) return ip === cidr;

  const slashIdx = cidr.indexOf('/');
  const rangeStr = cidr.slice(0, slashIdx);
  const bitsStr = cidr.slice(slashIdx + 1);
  if (!rangeStr || !bitsStr) return false;

  const bits = parseInt(bitsStr, 10);
  if (Number.isNaN(bits)) return false;

  const ipNum = ip.split('.').reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0) >>> 0;
  const rangeNum = rangeStr
    .split('.')
    .reduce((acc, oct) => (acc << 8) + parseInt(oct, 10), 0)
    >>> 0;

  const mask = ~0 << (32 - bits);
  return (ipNum & mask) === (rangeNum & mask);
}

export function ipBanCheck(): RequestHandler {
  const bannedIps: string[] = (process.env['BANNED_IPS'] ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (bannedIps.length === 0) {
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIp = (req.ip ?? '').replace(/^::ffff:/, '');
    const isBanned = bannedIps.some((banned) => ipInCidr(clientIp, banned));

    if (isBanned) {
      console.warn(`[Security] IP banned — requestId=${(req as any).requestId}, ip=${clientIp}`);
      res.status(403).json({ error: 'Forbidden', code: 'IP_BANNED' });
      return;
    }

    next();
  };
}
