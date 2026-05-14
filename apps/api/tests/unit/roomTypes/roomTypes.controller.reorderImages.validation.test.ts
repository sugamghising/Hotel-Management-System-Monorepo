import type { Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

const mocks = vi.hoisted(() => ({
  reorderImages: vi.fn(),
  success: vi.fn((data, message, status) => ({ data, message, status })),
  handleServiceResponse: vi.fn(),
}));

vi.mock('../../../src/api/roomTypes/roomTypes.service', () => ({
  roomTypesService: {
    reorderImages: mocks.reorderImages,
  },
}));

vi.mock('../../../src/common', () => ({
  ServiceResponse: {
    success: mocks.success,
  },
  handleServiceResponse: mocks.handleServiceResponse,
}));

import { roomTypesController } from '../../../src/api/roomTypes/roomTypes.controller';

describe('RoomTypesController.reorderImages validation', () => {
  afterEach(() => {
    mocks.reorderImages.mockReset();
    mocks.success.mockClear();
    mocks.handleServiceResponse.mockClear();
  });

  it('forwards validated image orders to service', async () => {
    mocks.reorderImages.mockResolvedValue({ id: 'rt-1' });

    const req = {
      params: { organizationId: 'org-1', roomTypeId: 'rt-1' },
      body: {
        orders: [
          { url: 'https://res.cloudinary.com/demo/image/upload/1.jpg', order: 1 },
          { url: 'https://res.cloudinary.com/demo/image/upload/0.jpg', order: 0 },
        ],
      },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    roomTypesController.reorderImages(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.reorderImages).toHaveBeenCalledWith('rt-1', 'org-1', [
      { url: 'https://res.cloudinary.com/demo/image/upload/1.jpg', order: 1 },
      { url: 'https://res.cloudinary.com/demo/image/upload/0.jpg', order: 0 },
    ]);
    expect(mocks.handleServiceResponse).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request when body orders are missing', async () => {
    const req = {
      params: { organizationId: 'org-1', roomTypeId: 'rt-1' },
      body: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    roomTypesController.reorderImages(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.reorderImages).not.toHaveBeenCalled();
    expect(mocks.handleServiceResponse).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ZodError);
  });
});
