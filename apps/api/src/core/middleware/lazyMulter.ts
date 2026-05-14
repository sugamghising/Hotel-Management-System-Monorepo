import type { RequestHandler } from 'express';

type LazyMulterOptions = {
  fieldName?: string;
  fieldNames?: string[];
  maxCount?: number;
  maxFileSizeMB?: number;
  allowedMimeTypes?: string[];
};

/**
 * Lazily-load multer and return an express middleware that accepts multiple image files.
 * Loading is deferred until the first request to avoid requiring the package at module-load time.
 */
export const lazyMulter = (options: LazyMulterOptions = {}): RequestHandler => {
  const {
    fieldName = 'images',
    fieldNames,
    maxCount = 10,
    maxFileSizeMB = 5,
    allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'],
  } = options;
  const acceptedFieldNames =
    Array.isArray(fieldNames) && fieldNames.length > 0 ? fieldNames : [fieldName];

  let middleware: RequestHandler | null = null;

  return async (req, res, next) => {
    try {
      if (!middleware) {
        const multerModule = await import('multer');
        // support both default and named exports
        const multer: any = (multerModule as any).default || multerModule;
        const storage = multer.memoryStorage();
        const upload = multer({
          storage,
          limits: { fileSize: maxFileSizeMB * 1024 * 1024, files: maxCount },
          fileFilter: (_req: any, file: any, cb: any) => {
            if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
            else cb(new Error('INVALID_FILE_TYPE'));
          },
        });
        middleware =
          acceptedFieldNames.length > 1
            ? (upload.fields(
                acceptedFieldNames.map((name) => ({ name, maxCount }))
              ) as RequestHandler)
            : (upload.array(acceptedFieldNames[0], maxCount) as RequestHandler);
      }

      // Call the underlying multer middleware and normalize files shape for multi-field mode.
      (middleware as any)(req, res, (err: unknown) => {
        if (err) {
          return next(err);
        }

        if (acceptedFieldNames.length > 1) {
          const filesValue = (req as { files?: unknown }).files;
          if (filesValue && !Array.isArray(filesValue) && typeof filesValue === 'object') {
            const normalizedFiles: unknown[] = [];
            for (const name of Object.keys(filesValue as Record<string, unknown[]>)) {
              const group = (filesValue as Record<string, unknown[]>)[name];
              if (Array.isArray(group)) {
                normalizedFiles.push(...group);
              }
            }
            (req as { files?: unknown[] }).files = normalizedFiles;
          }
        }

        next();
      });
    } catch (err) {
      next(err);
    }
  };
};
