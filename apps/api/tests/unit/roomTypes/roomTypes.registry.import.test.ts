import { describe, expect, it } from 'vitest';

describe('roomTypes registry module', () => {
  it('loads without throwing at module initialization', async () => {
    await expect(import('../../../src/api/roomTypes/roomTypes.registry')).resolves.toBeDefined();
  });
});
