import { afterEach, describe, expect, it, vi } from 'vitest';

const extractQueryText = (query: unknown): string => {
  if (typeof query === 'string') {
    return query;
  }

  if (Array.isArray(query)) {
    return query.join(' ');
  }

  if (query && typeof query === 'object') {
    const value = query as { sql?: string; text?: string; strings?: readonly string[] };
    if (typeof value.sql === 'string') {
      return value.sql;
    }
    if (typeof value.text === 'string') {
      return value.text;
    }
    if (Array.isArray(value.strings)) {
      return value.strings.join(' ');
    }
  }

  return '';
};

const mocks = vi.hoisted(() => ({
  queryRaw: vi.fn(),
}));

vi.mock('../../../src/database/prisma', () => ({
  prisma: {
    $queryRaw: mocks.queryRaw,
  },
}));

import { HotelRepository } from '../../../src/api/hotel/hotel.repository';

describe('HotelRepository.getRoomTypeAvailability', () => {
  afterEach(() => {
    mocks.queryRaw.mockReset();
  });

  it('uses enum-safe occupied status filtering in raw SQL', async () => {
    mocks.queryRaw.mockResolvedValueOnce([]);
    const repository = new HotelRepository();

    await repository.getRoomTypeAvailability('00000000-0000-0000-0000-000000000001');

    const sql = extractQueryText(mocks.queryRaw.mock.calls[0]?.[0]).toLowerCase();
    expect(sql).not.toContain("r.status like 'occupied%'");
    expect(sql).toContain(
      "r.status in ('occupied_clean', 'occupied_dirty', 'occupied_cleaning')"
    );
  });
});
