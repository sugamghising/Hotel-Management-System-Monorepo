import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

const mocks = vi.hoisted(() => ({
  removeImage: vi.fn(),
  success: vi.fn((data, message, status) => ({ data, message, status })),
  handleServiceResponse: vi.fn(),
}));

vi.mock('../../../src/api/roomTypes/roomTypes.service', () => ({
  roomTypesService: {
    removeImage: mocks.removeImage,
  },
}));

vi.mock('../../../src/common', () => ({
  ServiceResponse: {
    success: mocks.success,
  },
  handleServiceResponse: mocks.handleServiceResponse,
}));

import { roomTypesController } from '../../../src/api/roomTypes/roomTypes.controller';

describe('RoomTypesController.removeImage validation', () => {
  afterEach(() => {
    mocks.removeImage.mockReset();
    mocks.success.mockClear();
    mocks.handleServiceResponse.mockClear();
  });

  it('forwards validated image url to service', async () => {
    mocks.removeImage.mockResolvedValue({ id: 'rt-1' });

    const req = {
      params: { organizationId: 'org-1', roomTypeId: 'rt-1' },
      body: { url: 'https://res.cloudinary.com/demo/image/upload/room.jpg' },
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    roomTypesController.removeImage(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.removeImage).toHaveBeenCalledWith(
      'rt-1',
      'org-1',
      'https://res.cloudinary.com/demo/image/upload/room.jpg',
    );
    expect(mocks.handleServiceResponse).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects request when body url is missing', async () => {
    const req = {
      params: { organizationId: 'org-1', roomTypeId: 'rt-1' },
      body: {},
    } as unknown as Request;
    const res = {} as Response;
    const next = vi.fn();

    roomTypesController.removeImage(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.removeImage).not.toHaveBeenCalled();
    expect(mocks.handleServiceResponse).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0]?.[0]).toBeInstanceOf(ZodError);
  });
});
