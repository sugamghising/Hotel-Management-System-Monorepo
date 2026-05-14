import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  uploadBufferToCloudinary: vi.fn(),
  addImage: vi.fn(),
  success: vi.fn((data, message, status) => ({ data, message, status })),
  handleServiceResponse: vi.fn(),
}));

vi.mock('../../../src/core/cloudinary', () => ({
  uploadBufferToCloudinary: mocks.uploadBufferToCloudinary,
}));

vi.mock('../../../src/api/roomTypes/roomTypes.service', () => ({
  roomTypesService: {
    addImage: mocks.addImage,
  },
}));

vi.mock('../../../src/common', () => ({
  ServiceResponse: {
    success: mocks.success,
  },
  handleServiceResponse: mocks.handleServiceResponse,
}));

import { roomTypesController } from '../../../src/api/roomTypes/roomTypes.controller';

describe('RoomTypesController.addImage multipart flow', () => {
  afterEach(() => {
    mocks.uploadBufferToCloudinary.mockReset();
    mocks.addImage.mockReset();
    mocks.success.mockClear();
    mocks.handleServiceResponse.mockClear();
  });

  it('uploads multipart file to cloudinary and forwards resulting url to service', async () => {
    mocks.uploadBufferToCloudinary.mockResolvedValue({
      url: 'https://res.cloudinary.com/demo/image/upload/room.jpg',
      publicId: 'hotels/h1/room-types/room',
    });
    mocks.addImage.mockResolvedValue({ id: 'rt-1' });

    const req: any = {
      params: { organizationId: 'org-1', hotelId: 'hotel-1', roomTypeId: 'rt-1' },
      files: [{ buffer: Buffer.from('abc'), originalname: 'room.jpg' }],
      body: { caption: 'Main', order: 2, isPrimary: true },
    };
    const res: any = {};
    const next = vi.fn();

    roomTypesController.addImage(req, res, next);
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mocks.uploadBufferToCloudinary).toHaveBeenCalledWith(
      req.files[0].buffer,
      'room.jpg',
      'hotels/hotel-1/room-types'
    );
    expect(mocks.addImage).toHaveBeenCalledWith('rt-1', 'org-1', {
      url: 'https://res.cloudinary.com/demo/image/upload/room.jpg',
      caption: 'Main',
      order: 2,
      isPrimary: true,
    });
    expect(mocks.handleServiceResponse).toHaveBeenCalledTimes(1);
    expect(next).not.toHaveBeenCalled();
  });
});
