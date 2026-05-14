import { describe, expect, it } from 'vitest';
import { CreateRoomTypeSchema } from '../../../src/api/roomTypes/roomTypes.schema';
import { parseMultipartBody } from '../../../src/core/middleware/parseMultipartFields';

describe('multipart body parsing helper', () => {
  it('coerces common multipart string fields into typed values', () => {
    const rawBody = {
      code: 'dlx',
      name: 'Deluxe Room',
      maxOccupancy: '4',
      baseOccupancy: '2',
      maxAdults: '2',
      maxChildren: '2',
      bedTypes: '["KING","SOFA_BED"]',
      amenities: 'WIFI,TV',
      defaultCleaningTime: '45',
      isActive: 'true',
      isBookable: 'false',
      displayOrder: '3',
    } as Record<string, unknown>;

    const parsedBody = parseMultipartBody(rawBody);

    const typed = CreateRoomTypeSchema.parse(parsedBody);

    expect(typed.code).toBe('DLX');
    expect(typed.maxOccupancy).toBe(4);
    expect(typed.baseOccupancy).toBe(2);
    expect(typed.maxAdults).toBe(2);
    expect(typed.maxChildren).toBe(2);
    expect(typed.bedTypes).toEqual(['KING', 'SOFA_BED']);
    expect(typed.amenities).toEqual(['WIFI', 'TV']);
    expect(typed.defaultCleaningTime).toBe(45);
    expect(typed.isActive).toBe(true);
    expect(typed.isBookable).toBe(false);
    expect(typed.displayOrder).toBe(3);
  });
});
