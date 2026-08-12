import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * Custom Application Error class.
 * Used to create typed, predictable HTTP errors throughout the app.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_SERVER_ERROR',
    options?: { cause?: unknown }
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Distinguishes from programming errors
    if (options?.cause !== undefined) {
      this.cause = options.cause;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Centralized error handling middleware.
 * Must be the LAST middleware registered in app.ts.
 *
 * Handles:
 * - AppError (custom operational errors)
 * - ZodError (validation failures)
 * - Prisma errors (DB constraint violations, not-found, etc.)
 * - JWT errors (unauthorized, expired)
 * - Generic unhandled errors
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // 0. Response already (partially) sent — Express must destroy the socket,
  //    otherwise the error is lost behind an ERR_HTTP_HEADERS_SENT throw.
  if (res.headersSent) {
    logger.error('Error after response headers were sent:', {
      message: err.message,
      stack: err.stack,
      name: err.name,
    });
    next(err);
    return;
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 2. Custom Operational Errors (AppError)
  if (err instanceof AppError && err.isOperational) {
    if (err.statusCode >= 500) {
      logger.error('Operational error:', {
        message: err.message,
        code: err.code,
        stack: err.stack,
        cause: err.cause,
      });
    }
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 3. Prisma Known Request Errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const field = (err.meta?.['target'] as string[])?.join(', ') ?? 'field';
      res.status(409).json({
        success: false,
        message: `A record with this ${field} already exists`,
        code: 'CONFLICT',
        timestamp: new Date().toISOString(),
      });
      return;
    }
    if (err.code === 'P2025') {
      // Record not found
      res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    // Any other Prisma failure is a server-side problem — log it before the
    // generic 500 below so the DB error code is not lost.
    logger.error('Unhandled Prisma error:', {
      code: err.code,
      message: err.message,
      meta: err.meta,
    });
  }

  // 4. JWT Errors (handled by auth middleware, but caught here as fallback)
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token has expired',
      code: 'TOKEN_EXPIRED',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // 5. Unknown / Programming Errors
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  res.status(500).json({
    success: false,
    message:
      env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
    code: 'INTERNAL_SERVER_ERROR',
    ...(env.NODE_ENV !== 'production' && { stack: err.stack }),
    timestamp: new Date().toISOString(),
  });
}
