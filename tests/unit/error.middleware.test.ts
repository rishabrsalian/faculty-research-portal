import { Request, Response, NextFunction } from 'express';
import { ZodError, z } from 'zod';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

jest.mock('../../src/config/env', () => ({
  env: { NODE_ENV: 'test' },
}));

jest.mock('../../src/utils/logger', () => ({
  logger: { error: jest.fn(), warn: jest.fn(), info: jest.fn(), http: jest.fn() },
}));

import { AppError, errorHandler } from '../../src/middleware/error.middleware';
import { logger } from '../../src/utils/logger';

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
  headersSent: boolean;
};

function createResponse(headersSent = false): MockResponse {
  const res = {
    headersSent,
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res as unknown as MockResponse;
}

describe('errorHandler', () => {
  const req = {} as Request;
  let next: NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
    next = jest.fn();
  });

  it('returns the status and code of an AppError', () => {
    const res = createResponse();

    errorHandler(new AppError('Publication not found', 404, 'NOT_FOUND'), req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: 'Publication not found', code: 'NOT_FOUND' })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('logs server-side AppErrors', () => {
    errorHandler(new AppError('DB unreachable', 503, 'SERVICE_UNAVAILABLE'), req, createResponse(), next);

    expect(logger.error).toHaveBeenCalled();
  });

  it('reports Zod failures with field-level errors', () => {
    const res = createResponse();
    const schema = z.object({ body: z.object({ email: z.string().email() }) });
    let zodError: ZodError | undefined;
    try {
      schema.parse({ body: { email: 'not-an-email' } });
    } catch (error) {
      zodError = error as ZodError;
    }

    errorHandler(zodError as ZodError, req, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        errors: [expect.objectContaining({ field: 'body.email' })],
      })
    );
  });

  it('logs unmapped Prisma errors before falling back to a 500', () => {
    const res = createResponse();
    const prismaError = new PrismaClientKnownRequestError('Foreign key constraint failed', {
      code: 'P2003',
      clientVersion: '5.22.0',
      meta: { field_name: 'facultyId' },
    });

    errorHandler(prismaError, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(
      'Unhandled Prisma error:',
      expect.objectContaining({ code: 'P2003' })
    );
    expect(res.status).toHaveBeenCalledWith(500);
  });

  it('delegates to Express when the response has already been sent', () => {
    const res = createResponse(true);
    const error = new Error('write after end');

    errorHandler(error, req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(error);
    expect(logger.error).toHaveBeenCalled();
  });
});
