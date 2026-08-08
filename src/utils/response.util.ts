import { Response } from 'express';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
  PaginationMeta,
  ErrorCode,
  ValidationError,
} from '../types/api.types';

/**
 * Send a standardized success response.
 *
 * @param res     - Express Response object
 * @param data    - The payload to return
 * @param message - Human-readable success message
 * @param status  - HTTP status code (default: 200)
 * @param pagination - Optional pagination metadata for list endpoints
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  status = 200,
  pagination?: PaginationMeta
): Response {
  const response: ApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    ...(pagination && { pagination }),
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(response);
}

/**
 * Send a standardized error response.
 *
 * @param res     - Express Response object
 * @param message - Human-readable error message
 * @param status  - HTTP status code (default: 500)
 * @param code    - Machine-readable error code
 * @param errors  - Optional array of field-level validation errors
 */
export function sendError(
  res: Response,
  message: string,
  status = 500,
  code: ErrorCode = 'INTERNAL_SERVER_ERROR',
  errors?: ValidationError[]
): Response {
  const response: ApiErrorResponse = {
    success: false,
    message,
    code,
    ...(errors && errors.length > 0 && { errors }),
    timestamp: new Date().toISOString(),
  };
  return res.status(status).json(response);
}

/**
 * Shorthand helpers for common status codes.
 */
export const respond = {
  ok: <T>(res: Response, data: T, message?: string, pagination?: PaginationMeta) =>
    sendSuccess(res, data, message ?? 'OK', 200, pagination),

  created: <T>(res: Response, data: T, message?: string) =>
    sendSuccess(res, data, message ?? 'Created successfully', 201),

  noContent: (res: Response) => res.status(204).send(),

  badRequest: (res: Response, message: string, errors?: ValidationError[]) =>
    sendError(res, message, 400, 'BAD_REQUEST', errors),

  unauthorized: (res: Response, message = 'Authentication required') =>
    sendError(res, message, 401, 'UNAUTHORIZED'),

  forbidden: (res: Response, message = 'Access denied') =>
    sendError(res, message, 403, 'FORBIDDEN'),

  notFound: (res: Response, message = 'Resource not found') =>
    sendError(res, message, 404, 'NOT_FOUND'),

  conflict: (res: Response, message: string) =>
    sendError(res, message, 409, 'CONFLICT'),

  validationError: (res: Response, errors: ValidationError[]) =>
    sendError(res, 'Validation failed', 422, 'VALIDATION_ERROR', errors),

  serverError: (res: Response, message = 'Internal server error') =>
    sendError(res, message, 500, 'INTERNAL_SERVER_ERROR'),
};
