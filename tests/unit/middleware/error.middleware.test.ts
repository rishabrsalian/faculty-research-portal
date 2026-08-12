import { NextFunction, Request } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { AppError, errorHandler } from '../../../src/middleware/error.middleware';
import { env } from '../../../src/config/env';
import { logger } from '../../../src/utils/logger';
import { mockRequest, mockResponse, jsonBody, MockResponse } from '../../helpers/express';

const next = (() => undefined) as NextFunction;
const req: Request = mockRequest();

const handle = (err: Error, res: MockResponse) => errorHandler(err, req, res, next);

const prismaError = (code: string, meta?: Record<string, unknown>) =>
  new PrismaClientKnownRequestError('prisma failure', {
    code,
    clientVersion: '5.22.0',
    ...(meta ? { meta } : {}),
  });

describe('AppError', () => {
  it('defaults to a 500 INTERNAL_SERVER_ERROR and is flagged operational', () => {
    const err = new AppError('oops');
    expect(err).toBeInstanceOf(Error);
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe('INTERNAL_SERVER_ERROR');
    expect(err.isOperational).toBe(true);
    expect(err.stack).toBeDefined();
  });

  it('keeps the supplied status code and error code', () => {
    const err = new AppError('nope', 403, 'FORBIDDEN');
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN');
  });
});

describe('errorHandler', () => {
  let res: MockResponse;

  beforeEach(() => {
    res = mockResponse();
    jest.restoreAllMocks();
  });

  it('maps a ZodError to 422 with per-field errors', () => {
    const schema = z.object({ body: z.object({ email: z.string().email() }) });
    const result = schema.safeParse({ body: { email: 'not-an-email' } });
    expect(result.success).toBe(false);

    handle((result as z.SafeParseError<unknown>).error, res);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(jsonBody(res)).toMatchObject({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: [{ field: 'body.email', message: 'Invalid email' }],
    });
  });

  it('uses the status and code of an operational AppError', () => {
    handle(new AppError('Patent not found', 404, 'NOT_FOUND'), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonBody(res)).toMatchObject({
      success: false,
      message: 'Patent not found',
      code: 'NOT_FOUND',
    });
  });

  it('maps a Prisma P2002 unique constraint violation to 409 naming the fields', () => {
    handle(prismaError('P2002', { target: ['email', 'orcidId'] }), res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(jsonBody(res)).toMatchObject({
      code: 'CONFLICT',
      message: 'A record with this email, orcidId already exists',
    });
  });

  it('falls back to "field" when P2002 carries no target metadata', () => {
    handle(prismaError('P2002'), res);
    expect(jsonBody(res)['message']).toBe('A record with this field already exists');
  });

  it('maps a Prisma P2025 missing record to 404', () => {
    handle(prismaError('P2025'), res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(jsonBody(res)).toMatchObject({ code: 'NOT_FOUND', message: 'Record not found' });
  });

  it('treats an unhandled Prisma error code as an unknown 500 error', () => {
    jest.spyOn(logger, 'error').mockImplementation(() => logger);
    handle(prismaError('P2003'), res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(jsonBody(res)['code']).toBe('INTERNAL_SERVER_ERROR');
  });

  it('maps JWT errors to 401', () => {
    handle(new jwt.JsonWebTokenError('invalid signature'), res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(jsonBody(res)).toMatchObject({ code: 'INVALID_TOKEN', message: 'Invalid token' });

    const expiredRes = mockResponse();
    handle(new jwt.TokenExpiredError('jwt expired', new Date()), expiredRes);
    expect(expiredRes.status).toHaveBeenCalledWith(401);
    expect(jsonBody(expiredRes)).toMatchObject({
      code: 'TOKEN_EXPIRED',
      message: 'Token has expired',
    });
  });

  it('logs unknown errors and exposes the message and stack outside production', () => {
    const errorLog = jest.spyOn(logger, 'error').mockImplementation(() => logger);
    handle(new Error('database exploded'), res);

    expect(errorLog).toHaveBeenCalledWith(
      'Unhandled error:',
      expect.objectContaining({ message: 'database exploded' })
    );
    expect(res.status).toHaveBeenCalledWith(500);
    const body = jsonBody(res);
    expect(body['message']).toBe('database exploded');
    expect(body['stack']).toBeDefined();
  });

  it('hides internal details for unknown errors in production', () => {
    jest.spyOn(logger, 'error').mockImplementation(() => logger);
    const nodeEnv = env.NODE_ENV;
    (env as { NODE_ENV: string }).NODE_ENV = 'production';
    try {
      handle(new Error('database exploded'), res);
      const body = jsonBody(res);
      expect(body['message']).toBe('An unexpected error occurred');
      expect(body).not.toHaveProperty('stack');
    } finally {
      (env as { NODE_ENV: string }).NODE_ENV = nodeEnv;
    }
  });
});
