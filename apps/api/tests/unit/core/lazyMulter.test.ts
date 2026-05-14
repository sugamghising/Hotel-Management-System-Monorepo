import type { NextFunction, Request, Response } from 'express';
import { afterEach, describe, expect, it, vi } from 'vitest';

type FakeFile = { fieldname: string; mimetype: string };

const mocks = vi.hoisted(() => {
  const anyMiddleware = vi.fn();
  const arrayMiddleware = vi.fn();
  const fieldsMiddleware = vi.fn();

  const uploadApi = {
    any: vi.fn(() => anyMiddleware),
    array: vi.fn(() => arrayMiddleware),
    fields: vi.fn(() => fieldsMiddleware),
  };

  const multerFactory = vi.fn(() => uploadApi);
  (multerFactory as any).memoryStorage = vi.fn(() => ({}));

  return {
    anyMiddleware,
    arrayMiddleware,
    fieldsMiddleware,
    uploadApi,
    multerFactory,
  };
});

vi.mock('multer', () => ({
  default: mocks.multerFactory,
}));

import { lazyMulter } from '../../../src/core/middleware/lazyMulter';

describe('lazyMulter', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('accepts image file when multiple field names are allowed', async () => {
    mocks.fieldsMiddleware.mockImplementation(
      (req: Request & { files?: FakeFile[] }, _res: Response, next: NextFunction) => {
        req.files = [{ fieldname: 'image', mimetype: 'image/jpeg' }];
        next();
      }
    );

    const middleware = lazyMulter({ fieldNames: ['image', 'images'], maxCount: 1 } as any);

    const req = {} as Request & { files?: FakeFile[] };
    const res = {} as Response;
    const next = vi.fn();

    await middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(mocks.uploadApi.fields).toHaveBeenCalled();
  });
});
