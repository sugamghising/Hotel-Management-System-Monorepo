import { describe, expect, it, vi } from 'vitest';
import type { AuthRepository } from '../../../src/api/auth/auth.repository';
import { AuthService } from '../../../src/api/auth/auth.service';
import type { OrganizationService } from '../../../src/api/organizations';

const mocks = vi.hoisted(() => ({
  jwtVerify: vi.fn(),
  jwtSign: vi.fn(),
  hashToken: vi.fn(),
  generateRandomToken: vi.fn(),
}));

vi.mock('../../../src/database/prisma', () => ({
  prisma: {},
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    verify: mocks.jwtVerify,
    sign: mocks.jwtSign,
  },
}));

vi.mock('../../../src/core/utils/crypto', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
  generateRandomToken: mocks.generateRandomToken,
  hashToken: mocks.hashToken,
}));

describe('AuthService.refreshToken rotation', () => {
  it('atomically replaces the previous refresh token', async () => {
    mocks.hashToken.mockReturnValue('hashed-opaque');
    mocks.generateRandomToken.mockReturnValue('random');
    mocks.jwtSign.mockReturnValue('signed-jwt');
    mocks.jwtVerify.mockReturnValue({
      sub: 'user-1',
      type: 'refresh',
      orgId: 'org-1',
    });

    const authRepo = {
      findRefreshTokenByHash: vi.fn().mockResolvedValue({
        id: 'old-token-id',
        deviceFingerprint: null,
      }),
      findUserById: vi.fn().mockResolvedValue({
        id: 'user-1',
        email: 'user@example.com',
        firstName: 'A',
        lastName: 'B',
        status: 'ACTIVE',
        isSuperAdmin: false,
        deletedAt: null,
        mfaEnabled: false,
      }),
      getUserPermissions: vi.fn().mockResolvedValue(['USER.READ']),
      createRefreshToken: vi.fn(),
      revokeRefreshToken: vi.fn(),
      replaceRefreshToken: vi.fn().mockResolvedValue({ id: 'new-token-id' }),
    };

    const orgService = {
      findById: vi.fn().mockResolvedValue({
        id: 'org-1',
        code: 'DEMO',
        subscriptionTier: 'BASIC',
      }),
    };

    const service = new AuthService(
      authRepo as unknown as AuthRepository,
      orgService as unknown as OrganizationService
    );

    await service.refreshToken('header.payload.signature.opaque-secret');

    expect(authRepo.replaceRefreshToken).toHaveBeenCalledTimes(1);
    expect(authRepo.replaceRefreshToken).toHaveBeenCalledWith(
      'old-token-id',
      expect.objectContaining({
        tokenHash: 'hashed-opaque',
      })
    );
    expect(authRepo.createRefreshToken).not.toHaveBeenCalled();
    expect(authRepo.revokeRefreshToken).not.toHaveBeenCalled();
  });
});
