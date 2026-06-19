import { Prisma } from '../../generated/prisma';
import { prisma } from '../../database/prisma';
import { sanitizeResponseForLog } from '../utils/masking';

interface AuditEntry {
  organizationId: string;
  hotelId?: string | undefined;
  userId?: string | undefined;
  userEmail?: string | undefined;
  userRole?: string | undefined;
  action: string;
  resourceType: string;
  resourceId?: string | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
  changes?: Record<string, any> | undefined;
  metadata?: Record<string, any> | undefined;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isSensitive?: boolean;
}

export class AuditService {
  async log(entry: AuditEntry): Promise<void> {
    try {
      const sanitized = this.sanitizeChanges(entry.changes);

      const data: Record<string, any> = {
        organizationId: entry.organizationId,
        hotelId: entry.hotelId ?? null,
        userId: entry.userId ?? null,
        userEmail: entry.userEmail ?? null,
        userRole: entry.userRole ?? null,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId ?? null,
        ipAddress: entry.ipAddress ?? null,
        userAgent: entry.userAgent ? entry.userAgent.slice(0, 500) : null,
        riskLevel: entry.riskLevel ?? 'LOW',
        isSensitive: entry.isSensitive ?? false,
      };

      if (sanitized) data['changes'] = sanitized;
      if (entry.metadata) data['metadata'] = entry.metadata;

      await prisma.auditLog.create({ data: data as any });
    } catch (err) {
      console.error('[AuditService] Failed to write audit log:', err);
    }
  }

  logAsync(entry: AuditEntry): void {
    this.log(entry).catch(() => {});
  }

  private sanitizeChanges(changes?: AuditEntry['changes']): Record<string, any> | undefined {
    if (!changes) return undefined;

    const SENSITIVE_KEYS = [
      'passwordHash', 'password', 'mfaSecret', 'mfaBackupCodes',
      'cardToken', 'apiKey', 'apiSecret', 'tokenHash',
      'passwordResetToken', 'refreshToken',
    ];

    const scrub = (obj: Record<string, any>): Record<string, any> => {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (SENSITIVE_KEYS.includes(key)) {
          result[key] = '[REDACTED]';
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = scrub(value);
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    const ch = changes as Record<string, any>;
    return {
      before: ch['before'] ? scrub(ch['before']) : undefined,
      after: ch['after'] ? sanitizeResponseForLog(ch['after'] as Record<string, any>) : undefined,
    };
  }

  static riskLevel(action: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const CRITICAL = [
      'ORG_DELETE', 'HOTEL_DELETE', 'USER_DELETE',
      'INVOICE_VOID', 'PAYMENT_VOID', 'NIGHT_AUDIT_ROLLBACK',
      'GUEST_ANONYMIZE',
    ];
    const HIGH = [
      'RESERVATION_CANCEL', 'RESERVATION_NO_SHOW',
      'PAYMENT_REFUND', 'FOLIO_VOID',
      'USER_SUSPEND', 'USER_DEACTIVATE',
      'HOTEL_STATUS_CHANGE', 'ROLE_UPDATE',
    ];
    const MEDIUM = [
      'RESERVATION_CREATE', 'RESERVATION_UPDATE',
      'RESERVATION_CHECK_IN', 'RESERVATION_CHECK_OUT',
      'PAYMENT_CREATE', 'INVOICE_CREATE',
      'RATE_PLAN_CREATE', 'RATE_PLAN_UPDATE',
      'USER_CREATE', 'USER_UPDATE',
      'ROOM_OOO_SET',
    ];
    if (CRITICAL.includes(action)) return 'CRITICAL';
    if (HIGH.includes(action)) return 'HIGH';
    if (MEDIUM.includes(action)) return 'MEDIUM';
    return 'LOW';
  }
}

export const auditService = new AuditService();
