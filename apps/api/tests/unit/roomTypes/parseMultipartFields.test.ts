import { describe, it, expect } from 'vitest';
import {
  parseMultipartBody,
  parseMultipartFields,
} from '../../../src/core/middleware/parseMultipartFields';

describe('parseMultipartFields middleware', () => {
  it('coerces add-image multipart scalar fields', () => {
    const parsed = parseMultipartBody({
      order: '4',
      isPrimary: 'true',
    });

    expect(parsed.order).toBe(4);
    expect(parsed.isPrimary).toBe(true);
  });

  it('rejects JSON images when no files are present', () => {
    const req: any = { body: { images: JSON.stringify([{ url: 'https://example.com/a.jpg' }]) }, files: undefined };
    let nextCalled = false;
    parseMultipartFields(req, {} as any, (err: any) => {
      expect(err).toBeInstanceOf(Error);
      expect(err.message).toMatch(/Do not include images/);
      nextCalled = true;
    });
    expect(nextCalled).toBe(true);
  });
});
