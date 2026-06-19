/*
 * ENCRYPTION USAGE
 *
 * Fields requiring application-layer encryption:
 *
 * guests.id_number:
 *   GuestService.create/update: encryptIfNeeded(input.idNumber)
 *   GuestService responses: decrypt(guest.idNumber) before returning
 *
 * channel_connections.api_key / api_secret:
 *   ChannelService.create/update: encryptIfNeeded(input.apiKey)
 *   Never return raw api_key/api_secret in API responses —
 *   return masked version: maskCardToken(decrypt(channel.apiKey))
 *
 * To apply encryption to existing data, run:
 *   pnpm --filter @hms/api db:encrypt-fields
 *   (migration script — not part of this prompt)
 */

import crypto from 'node:crypto';

// ── Card data masking (PCI DSS) ─────────────────────

export function maskCardNumber(pan: string): string {
  const digits = pan.replace(/\D/g, '');
  if (digits.length < 10) return '****';
  return `${digits.slice(0, 6)}******${digits.slice(-4)}`;
}

export function maskCardToken(token: string): string {
  if (token.length < 12) return `${token.slice(0, 4)}...`;
  return `${token.slice(0, 4)}...${token.slice(-4)}`;
}

export function sanitizeCardData(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (key === 'cardToken') {
      result[key] = maskCardToken(String(value));
    } else if (key === 'cardNumber') {
      result[key] = maskCardNumber(String(value));
    } else if (['cvv', 'cvc', 'securityCode'].includes(key)) {
      result[key] = '***';
    } else if (key === 'cardLastFour') {
      result[key] = value;
    } else if (['cardBrand', 'cardExpiryMonth', 'cardExpiryYear'].includes(key)) {
      result[key] = value;
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizeCardData(value);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// ── PII masking for logs and audit trails ───────────

export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex <= 0) return email;
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  if (local.length <= 2) return `${local}****${domain}`;
  return `${local.slice(0, 2)}****${domain}`;
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return '***-**-**';
  const countryCode = phone.startsWith('+') ? phone.charAt(0) : '';
  const national = phone.replace(/^\+/, '');
  const lastTwo = digits.slice(-2);
  const firstPart = national.slice(0, Math.max(1, national.length - 5));
  return `${countryCode}${firstPart.slice(0, 2)}***-**${lastTwo}`;
}

export function maskIdNumber(id: string): string {
  if (id.length <= 4) return id.replace(/./g, '*');
  return `${id.slice(0, 2)}****${id.slice(-2)}`;
}

export function maskName(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 1) return `${part}****`;
      return `${part[0]}****`;
    })
    .join(' ');
}

// ── Response sanitizer for audit trails ─────────────

const SENSITIVE_TOKEN_FIELDS = new Set([
  'token', 'cardToken', 'apiKey', 'apiSecret', 'tokenHash',
  'passwordHash', 'passwordResetToken', 'refreshToken', 'mfaSecret',
  'mfaBackupCodes',
]);

export function sanitizeResponseForLog(body: Record<string, any>): Record<string, any> {
  if (!body || typeof body !== 'object') return body;
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(body)) {
    if (value === null || value === undefined) {
      result[key] = value;
      continue;
    }

    if (key === 'passwordHash') {
      result[key] = '[HASH]';
      continue;
    }

    if (key === 'mfaSecret' || key === 'mfaBackupCodes') {
      result[key] = '[REDACTED]';
      continue;
    }

    if (key.toLowerCase().includes('token') || SENSITIVE_TOKEN_FIELDS.has(key)) {
      if (typeof value === 'string') {
        result[key] = value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : '****';
      } else {
        result[key] = '[REDACTED]';
      }
      continue;
    }

    if (typeof value === 'string' && value.length > 500) {
      result[key] = `${value.slice(0, 200)}... (truncated, ${value.length} chars)`;
      continue;
    }

    if (Array.isArray(value)) {
      if (value.length > 5) {
        result[key] = [...value.slice(0, 5), `... and ${value.length - 5} more items`];
      } else {
        result[key] = value;
      }
      continue;
    }

    if (value && typeof value === 'object') {
      result[key] = sanitizeResponseForLog(value);
      continue;
    }

    result[key] = value;
  }

  return sanitizeCardData(result);
}

// ── Encryption / Decryption utilities ───────────────

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

function getKey(): Buffer {
  const hex = process.env['ENCRYPTION_KEY'];
  if (!hex) throw new Error('ENCRYPTION_KEY environment variable is not set');
  return Buffer.from(hex, 'hex');
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();

  const combined = Buffer.concat([iv, authTag, encrypted]);
  return `enc:${combined.toString('base64')}`;
}

export function decrypt(ciphertext: string): string {
  if (!ciphertext.startsWith('enc:')) return ciphertext;

  const raw = Buffer.from(ciphertext.slice(4), 'base64');
  const iv = raw.subarray(0, IV_LENGTH);
  const authTag = raw.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const data = raw.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const key = getKey();
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = decipher.update(data) + decipher.final('utf8');
  return decrypted;
}

export function isEncrypted(value: string): boolean {
  return value.startsWith('enc:');
}

export function encryptIfNeeded(value: string | null): string | null {
  if (!value) return null;
  if (isEncrypted(value)) return value;
  return encrypt(value);
}
