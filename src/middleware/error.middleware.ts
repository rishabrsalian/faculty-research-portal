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

  constructor(message: string, statusCode = 500, code = 'INTERNAL_SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Distinguishes from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

interface ErrorPayloadExtras {
  errors?: { field: string; message: string }[];
  stack?: string | undefined;
}

/**
 * Sends the standard error envelope: `success`, `message`, `code`, timestamp
 * and any extras (field errors, stack in non-production).
 */
function sendErrorResponse(
  res: Response,
  status: number,
  message: string,
  code: string,
  extras: ErrorPayloadExtras = {}
): void {
  res.status(status).json({
    success: false,
    message,
    code,
    ...extras,
    timestamp: new Date().toISOString(),
  });
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
  _next: NextFunction
): void {
  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    sendErrorResponse(res, 422, 'Validation failed', 'VALIDATION_ERROR', { errors });
    return;
  }

  // 2. Custom Operational Errors (AppError)
  if (err instanceof AppError && err.isOperational) {
    sendErrorResponse(res, err.statusCode, err.message, err.code);
    return;
  }

  // 3. Prisma Known Request Errors
  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      // Unique constraint violation
      const field = (err.meta?.['target'] as string[])?.join(', ') ?? 'field';
      sendErrorResponse(res, 409, `A record with this ${field} already exists`, 'CONFLICT');
      return;
    }
    if (err.code === 'P2025') {
      // Record not found
      sendErrorResponse(res, 404, 'Record not found', 'NOT_FOUND');
      return;
    }
  }

  // 4. JWT Errors (handled by auth middleware, but caught here as fallback)
  if (err.name === 'JsonWebTokenError') {
    sendErrorResponse(res, 401, 'Invalid token', 'INVALID_TOKEN');
    return;
  }

  if (err.name === 'TokenExpiredError') {
    sendErrorResponse(res, 401, 'Token has expired', 'TOKEN_EXPIRED');
    return;
  }

  // 5. Unknown / Programming Errors
  logger.error('Unhandled error:', {
    message: err.message,
    stack: err.stack,
    name: err.name,
  });

  const isProduction = env.NODE_ENV === 'production';
  sendErrorResponse(
    res,
    500,
    isProduction ? 'An unexpected error occurred' : err.message,
    'INTERNAL_SERVER_ERROR',
    isProduction ? {} : { stack: err.stack }
  );
}
