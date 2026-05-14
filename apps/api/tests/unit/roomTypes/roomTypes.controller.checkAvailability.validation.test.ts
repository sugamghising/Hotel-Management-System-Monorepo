import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

const mocks = vi.hoisted(() => ({
  checkAvailability: vi.fn(),
  success: vi.fn((data, message, status) => ({ data, message, status })),
  handleServiceResponse: vi.fn(),
}));

vi.mock('../../../src/api/roomTypes/roomTypes.service', () => ({
  roomTypesService: {
    checkAvailability: mocks.checkAvailability,
  },
}));

vi.mock('../../../src/common', () => ({
  ServiceResponse: {
    success: mocks.success,
  },
  handleServiceResponse: mocks.handleServiceResponse,
}));

import { roomTypesController } from '../../../src/api/roomTypes/roomTypes.controller';

describe('RoomTypesController.checkAvailability validation', () => {
  afterEach(() => {
    mocks.checkAvailability.mockReset();
    mocks.success.mockClear();
    mocks.handleServiceResponse.mockClear();
  });

  it('forwards validated availability input to service', async () => {
    mocks.checkAvailability.mockResolvedValue({ available: true });

    const req = {
      params: { roomTypeId: 'rt-1' },
      body: {
        checkIn: '2026-05-20T00:00:00.000Z',
        checkOut: '2026-05-21T00:00:00.000Z',
        adults: 2,
        children: 1,
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    roomTypesController.checkAvailability(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.checkAvailability).toHaveBeenCalledWith(
      'rt-1',
      expect.any(Date),
      expect.any(Date),
      { adults: 2, children: 1 },
    );
    expect(mocks.handleServiceResponse).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request when body is missing required fields', async () => {
    const req = {
      params: { roomTypeId: 'rt-1' },
      body: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    roomTypesController.checkAvailability(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.checkAvailability).not.toHaveBeenCalled();
    expect(mocks.handleServiceResponse).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ZodError);
  });
});
