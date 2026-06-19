import type { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import { config } from '../../config/index';
import { AppError, type ErrorResponse } from '../errors/index';
import { logger } from '../logger/index';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void => {
  const requestId = req.requestId ?? '';

  logger.error(`Error: ${err.message}`, {
    requestId,
    stack: err.stack,
    name: err.name,
    path: req.path,
    method: req.method,
  });

  const addRequestId = (response: ErrorResponse): ErrorResponse => {
    (response as any).requestId = requestId;
    return response;
  };

  if (err instanceof ZodError) {
    res.status(StatusCodes.BAD_REQUEST).json(
      addRequestId({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          statusCode: StatusCodes.BAD_REQUEST,
          details: err.flatten(),
        },
      })
    );
    return;
  }

  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        message: err.message,
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
      },
    };

    if (config.isDevelopment && !err.isOperational) {
      response.error.stack = err.stack;
    }

    res.status(err.statusCode).json(addRequestId(response));
    return;
  }

  if (err instanceof SyntaxError && 'body' in err) {
    res.status(StatusCodes.BAD_REQUEST).json(
      addRequestId({
        success: false,
        error: {
          message: 'Invalid JSON payload',
          code: 'INVALID_JSON',
          statusCode: StatusCodes.BAD_REQUEST,
        },
      })
    );
    return;
  }

  if (err.name === 'MulterError') {
    res.status(StatusCodes.BAD_REQUEST).json(
      addRequestId({
        success: false,
        error: {
          message: err.message,
          code: 'BAD_REQUEST',
          statusCode: StatusCodes.BAD_REQUEST,
        },
      })
    );
    return;
  }

  const statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
  const response: ErrorResponse = {
    success: false,
    error: {
      message: config.isProduction ? 'An unexpected error occurred' : err.message,
      code: 'INTERNAL_ERROR',
      statusCode,
    },
  };

  if (config.isDevelopment) {
    response.error.stack = err.stack;
  }

  res.status(statusCode).json(addRequestId(response));
};
