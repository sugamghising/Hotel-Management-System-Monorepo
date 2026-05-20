import { afterEach, describe, expect, it, vi } from 'vitest';
import { RoomTypesRepository } from '../../../src/api/roomTypes/roomTypes.repository';

const mocks = vi.hoisted(() => ({
  update: vi.fn(),
}));

vi.mock('../../../src/database/prisma', () => ({
  prisma: {
    roomInventory: {
      update: mocks.update,
    },
  },
}));

describe('RoomTypesRepository.refreshInventoryForStay', () => {
  afterEach(() => {
    mocks.update.mockReset();
  });

  it('recomputes sold and available for each stay date', async () => {
    const repo = new RoomTypesRepository();

    vi.spyOn(repo, 'getOrCreateInventory').mockResolvedValue({
      id: 'inv-1',
      roomTypeId: 'rt-1',
      date: new Date(2026, 4, 1),
      totalRooms: 10,
      outOfOrder: 1,
      blocked: 1,
      sold: 0,
      available: 8,
      overbookingLimit: 0,
      stopSell: false,
      closedToArrival: false,
      closedToDeparture: false,
      minStay: null,
      maxStay: null,
      rateOverride: null,
      reason: null,
      updatedAt: new Date(),
    } as never);

    vi.spyOn(repo, 'getSoldCount').mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    mocks.update.mockResolvedValue({} as never);

    await repo.refreshInventoryForStay(
      'rt-1',
      new Date(2026, 4, 1),
      new Date(2026, 4, 3)
    );

    expect(mocks.update).toHaveBeenCalledTimes(2);

    const firstCall = mocks.update.mock.calls[0]?.[0] as {
      where: { uq_inventory_roomtype_date: { roomTypeId: string; date: Date } };
      data: { sold: number; available: number };
    };
    expect(firstCall.where.uq_inventory_roomtype_date.roomTypeId).toBe('rt-1');
    expect(firstCall.where.uq_inventory_roomtype_date.date.toDateString()).toBe(
      new Date(2026, 4, 1).toDateString()
    );
    expect(firstCall.data).toEqual({ sold: 2, available: 6 });

    const secondCall = mocks.update.mock.calls[1]?.[0] as {
      where: { uq_inventory_roomtype_date: { roomTypeId: string; date: Date } };
      data: { sold: number; available: number };
    };
    expect(secondCall.where.uq_inventory_roomtype_date.date.toDateString()).toBe(
      new Date(2026, 4, 2).toDateString()
    );
    expect(secondCall.data).toEqual({ sold: 3, available: 5 });
  });
});
