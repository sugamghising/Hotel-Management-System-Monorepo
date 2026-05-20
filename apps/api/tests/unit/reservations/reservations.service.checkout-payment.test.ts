import { afterEach, describe, expect, it, vi } from 'vitest';
import { ReservationsService } from '../../../src/api/reservations/reservations.service';
import type { ReservationsRepository } from '../../../src/api/reservations/reservations.repository';
import type { ReservationWithRelations } from '../../../src/api/reservations/reservations.types';

const mocks = vi.hoisted(() => ({
  processPayment: vi.fn(),
}));

vi.mock('../../../src/api/folio/folio.service', () => ({
  folioService: {
    processPayment: mocks.processPayment,
  },
}));

describe('ReservationsService.checkOut payment', () => {
  afterEach(() => {
    mocks.processPayment.mockReset();
  });

  const buildReservation = (balance: number): ReservationWithRelations =>
    ({
      id: 'res-1',
      organizationId: 'org-1',
      hotelId: 'hotel-1',
      status: 'CHECKED_IN',
      balance,
      currencyCode: 'USD',
      confirmationNumber: 'CONF-1',
      deletedAt: null,
      rooms: [{ id: 'res-room-1', roomId: 'room-1', roomTypeId: 'rt-1' }],
    }) as unknown as ReservationWithRelations;

  it('calls folioService.processPayment when payment payload is provided', async () => {
    mocks.processPayment.mockResolvedValueOnce({});

    const reservationsRepo = {
      findById: vi.fn().mockResolvedValue(buildReservation(100)),
      checkOut: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ReservationsService(
      reservationsRepo as unknown as ReservationsRepository,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    vi.spyOn(service, 'findById').mockResolvedValue({} as never);

    await service.checkOut('res-1', 'org-1', 'hotel-1', {
      payment: { amount: 100, method: 'CASH' },
    });

    expect(mocks.processPayment).toHaveBeenCalledWith(
      'res-1',
      'org-1',
      {
        amount: 100,
        method: 'CASH',
        currencyCode: 'USD',
        notes: 'Checkout settlement',
      },
      undefined,
      'hotel-1'
    );
  });

  it('does not call folioService.processPayment when payment is omitted', async () => {
    const reservationsRepo = {
      findById: vi.fn().mockResolvedValue(buildReservation(0)),
      checkOut: vi.fn().mockResolvedValue(undefined),
    };

    const service = new ReservationsService(
      reservationsRepo as unknown as ReservationsRepository,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

    vi.spyOn(service, 'findById').mockResolvedValue({} as never);

    await service.checkOut('res-1', 'org-1', 'hotel-1', {
      lateCheckOut: false,
    });

    expect(mocks.processPayment).not.toHaveBeenCalled();
  });
});
