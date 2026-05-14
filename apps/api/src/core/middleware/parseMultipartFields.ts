import type { RequestHandler } from "express";

/**
 * Parse and coerce common multipart/form-data string fields into their expected types.
 * This supports clients that submit scalar values as strings when using multipart forms.
 */
export const parseMultipartBody = (
  body: Record<string, unknown>,
): Record<string, unknown> => {
  const result = { ...(body || {}) } as Record<string, unknown>;

  const numberFields = new Set([
    "baseOccupancy",
    "maxOccupancy",
    "maxAdults",
    "maxChildren",
    "defaultCleaningTime",
    "displayOrder",
    "order",
  ]);

  const booleanFields = new Set(["isActive", "isBookable", "isPrimary"]);

  for (const key of Object.keys(result)) {
    const val = result[key];

    // If client sent JSON-encoded arrays/objects as strings, attempt to parse them
    if (typeof val === "string") {
      const trimmed = val.trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          result[key] = JSON.parse(trimmed);
          continue;
        } catch (e) {
          // fallback to original string
        }
      }

      // comma-separated lists -> array
      if (
        trimmed.includes(",") &&
        (key === "amenities" || key === "bedTypes")
      ) {
        result[key] = trimmed
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        continue;
      }

      // number coercion
      if (numberFields.has(key)) {
        const num = Number(trimmed);
        if (!Number.isNaN(num)) result[key] = num;
        continue;
      }

      // boolean coercion
      if (booleanFields.has(key)) {
        if (trimmed === "true") result[key] = true;
        else if (trimmed === "false") result[key] = false;
        continue;
      }
    }

    // If it's an array-like coming from form multiple fields (e.g., bedTypes=KING&bedTypes=QUEEN)
    if (Array.isArray(val) && (key === "bedTypes" || key === "amenities")) {
      result[key] = (val as unknown[]).map((v) =>
        typeof v === "string" ? v.trim() : v,
      );
    }
  }

  return result;
};

export const parseMultipartFields: RequestHandler = (req, _res, next) => {
  try {
    const files = (req as { files?: unknown[] }).files;
    // Prevent clients from sending JSON-based images in the body for create endpoint.
    // Images must be uploaded as multipart files under the 'images' field.
    if (
      Object.prototype.hasOwnProperty.call(req.body || {}, "images") &&
      !(Array.isArray(files) && files.length > 0)
    ) {
      const err: any = new Error(
        'Do not include images in the JSON body. Upload files using the "images" multipart form field.',
      );
      err.statusCode = 400;
      return next(err);
    }

    req.body = parseMultipartBody(req.body as Record<string, unknown>);
    next();
  } catch (err) {
    next(err);
  }
};
