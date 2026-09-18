import type { Request, Response } from 'express';

export const REFRESH_COOKIE_NAME = 'hms_refresh';
const REFRESH_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = {
  httpOnly: true,
  secure: process.env['NODE_ENV'] === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: REFRESH_COOKIE_MAX_AGE_MS,
};

export function parseCookieHeader(header?: string): Record<string, string> {
  if (!header) {
    return {};
  }

  const cookies: Record<string, string> = {};
  for (const part of header.split(';')) {
    const [name, ...rest] = part.trim().split('=');
    if (!name) {
      continue;
    }
    cookies[name] = decodeURIComponent(rest.join('='));
  }
  return cookies;
}

export function getRefreshTokenFromRequest(
  req: Request,
  bodyToken?: string
): string | undefined {
  if (bodyToken) {
    return bodyToken;
  }
  return parseCookieHeader(req.headers.cookie)[REFRESH_COOKIE_NAME];
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, cookieOptions);
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    path: '/',
  });
}
