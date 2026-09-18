import { describe, expect, it, vi } from 'vitest';
import type { AuthRepository } from '../../../src/api/auth/auth.repository';
import { AuthService } from '../../../src/api/auth/auth.service';
import type { User } from '../../../src/api/auth/auth.types';
import type { OrganizationService } from '../../../src/api/organizations';

const mocks = vi.hoisted(() => ({
  hashPassword: vi.fn(),
}));

vi.mock('../../../src/database/prisma', () => ({
  prisma: {},
}));

vi.mock('../../../src/core/utils/crypto', () => ({
  hashPassword: mocks.hashPassword,
  verifyPassword: vi.fn(),
  generateRandomToken: vi.fn(),
  hashToken: vi.fn(),
}));

describe('AuthService.register', () => {
  it('does not return passwordHash or other secrets', async () => {
    mocks.hashPassword.mockResolvedValue('hashed-password');

    const createdUser = {
      id: 'user-1',
      email: 'new@example.com',
      firstName: 'New',
      lastName: 'User',
      status: 'PENDING_VERIFICATION',
      mfaEnabled: false,
      passwordHash: 'hashed-password',
      mfaSecret: 'should-not-leak',
      passwordResetToken: 'should-not-leak',
    } as User;

    const authRepo = {
      findUserByEmail: vi.fn().mockResolvedValue(null),
      createUser: vi.fn().mockResolvedValue(createdUser),
    };

    const orgService = {
      findById: vi.fn().mockResolvedValue({ id: 'org-1' }),
      validateLimits: vi.fn().mockResolvedValue({ valid: true }),
    };

    const service = new AuthService(
      authRepo as unknown as AuthRepository,
      orgService as unknown as OrganizationService
    );

    const result = await service.register({
      organizationId: 'org-1',
      email: 'new@example.com',
      password: 'ValidPass123!@#',
      firstName: 'New',
      lastName: 'User',
    });

    expect(result).toEqual(
      expect.objectContaining({
        id: 'user-1',
        email: 'new@example.com',
        firstName: 'New',
        lastName: 'User',
        status: 'PENDING_VERIFICATION',
        mfaEnabled: false,
      })
    );
    expect(result).not.toHaveProperty('passwordHash');
    expect(result).not.toHaveProperty('mfaSecret');
    expect(result).not.toHaveProperty('passwordResetToken');
  });
});
