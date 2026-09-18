import { describe, expect, it, vi } from 'vitest';

vi.mock('../../../src/database/prisma', () => ({
  prisma: {},
}));

import { UserService } from '../../../src/api/user/user.service';
import { NotFoundError } from '../../../src/core/errors';

describe('UserService organization scoping', () => {
  it('findById throws when the user belongs to another organization', async () => {
    const userRepo = {
      findById: vi.fn().mockResolvedValue({
        id: 'user-1',
        organizationId: 'org-other',
        deletedAt: null,
      }),
    };

    const service = new UserService(
      userRepo as unknown as ConstructorParameters<typeof UserService>[0],
      {} as ConstructorParameters<typeof UserService>[1]
    );

    await expect(service.findById('user-1', 'org-1')).rejects.toBeInstanceOf(NotFoundError);
  });

  it('getUserProfile throws when the user belongs to another organization', async () => {
    const userRepo = {
      findWithRoles: vi.fn().mockResolvedValue({
        id: 'user-1',
        organizationId: 'org-other',
        deletedAt: null,
        userRoles: [],
      }),
      getUserPermissions: vi.fn(),
    };

    const service = new UserService(
      userRepo as unknown as ConstructorParameters<typeof UserService>[0],
      {} as ConstructorParameters<typeof UserService>[1]
    );

    await expect(service.getUserProfile('user-1', 'org-1')).rejects.toBeInstanceOf(NotFoundError);
    expect(userRepo.getUserPermissions).not.toHaveBeenCalled();
  });
});
