import { describe, expect, it } from 'vitest';
import { VerifyMfaSchema } from '../../../src/api/auth/auth.schema';

describe('VerifyMfaSchema', () => {
  it('requires a TOTP secret for MFA enablement', () => {
    const result = VerifyMfaSchema.safeParse({ code: '123456' });

    expect(result.success).toBe(false);
  });

  it('accepts a 6-digit code with the setup secret', () => {
    const result = VerifyMfaSchema.safeParse({
      code: '123456',
      secret: 'JBSWY3DPEHPK3PXP',
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.secret).toBe('JBSWY3DPEHPK3PXP');
    }
  });
});
