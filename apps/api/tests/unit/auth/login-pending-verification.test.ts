import { describe, expect, it, vi } from 'vitest';
import type { AuthRepository } from '../../../src/api/auth/auth.repository';
import { AuthService } from '../../../src/api/auth/auth.service';
import type { User } from '../../../src/api/auth/auth.types';
import type { OrganizationService } from '../../../src/api/organizations';
import { ForbiddenError } from '../../../src/core/errors';

const mocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

vi.mock('../../../src/database/prisma', () => ({
  prisma: {},
}));

vi.mock('../../../src/core/utils/crypto', () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: mocks.verifyPassword,
  generateRandomToken: vi.fn(),
  hashToken: vi.fn(),
}));

describe('AuthService.login pending verification', () => {
  it('rejects login for PENDING_VERIFICATION accounts', async () => {
    mocks.hashPassword.mockResolvedValue('dummy');
    mocks.verifyPassword.mockResolvedValue(true);

    const authRepo = {
      findUserByEmail: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'pending@example.com',
        passwordHash: 'hash',
        status: 'PENDING_VERIFICATION',
        lockedUntil: null,
        mfaEnabled: false,
        failedLoginAttempts: 0,
      } as User),
    };

    const orgService = {
      findByCode: vi.fn().mockResolvedValue({
        id: 'org-1',
        code: 'DEMO',
        deletedAt: null,
        subscriptionStatus: 'ACTIVE',
      }),
    };

    const service = new AuthService(
      authRepo as unknown as AuthRepository,
      orgService as unknown as OrganizationService
    );

    await expect(
      service.login({
        email: 'pending@example.com',
        password: 'ValidPass123!',
        organizationCode: 'DEMO',
      })
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(mocks.verifyPassword).not.toHaveBeenCalled();
  });
});
