import { EventEmitter } from 'events';
import { Response } from 'express';
import { httpLogger } from '../../../src/middleware/logger.middleware';
import { logger } from '../../../src/utils/logger';
import { mockRequest } from '../../helpers/express';

/** Response double that emits 'finish' on demand, like a real Express response. */
class FakeResponse extends EventEmitter {
  constructor(public statusCode: number) {
    super();
  }
  finish() {
    this.emit('finish');
  }
}

const run = (statusCode: number, reqOverrides = {}) => {
  const res = new FakeResponse(statusCode);
  const next = jest.fn();
  const req = mockRequest({
    method: 'GET',
    originalUrl: '/api/v1/publications',
    ip: '10.0.0.1',
    get: jest.fn().mockReturnValue('jest-agent'),
    ...reqOverrides,
  } as never);

  httpLogger(req, res as unknown as Response, next);
  res.finish();
  return next;
};

describe('httpLogger', () => {
  let error: jest.SpyInstance;
  let warn: jest.SpyInstance;
  let http: jest.SpyInstance;

  beforeEach(() => {
    error = jest.spyOn(logger, 'error').mockImplementation(() => logger);
    warn = jest.spyOn(logger, 'warn').mockImplementation(() => logger);
    http = jest.spyOn(logger, 'http').mockImplementation(() => logger);
  });

  afterEach(() => jest.restoreAllMocks());

  it('passes the request along immediately and logs only once the response finishes', () => {
    const next = run(200);
    expect(next).toHaveBeenCalledWith();
    expect(http).toHaveBeenCalledTimes(1);
  });

  it('logs request metadata including the authenticated user id', () => {
    run(200, { user: { sub: 'user-9' } });
    expect(http).toHaveBeenCalledWith(
      'HTTP Request',
      expect.objectContaining({
        method: 'GET',
        url: '/api/v1/publications',
        status: 200,
        ip: '10.0.0.1',
        userAgent: 'jest-agent',
        userId: 'user-9',
        duration: expect.stringMatching(/^\d+ms$/),
      })
    );
  });

  it('reports a null userId for anonymous requests and "unknown" without a user agent', () => {
    run(200, { get: jest.fn().mockReturnValue(undefined) });
    expect(http).toHaveBeenCalledWith(
      'HTTP Request',
      expect.objectContaining({ userId: null, userAgent: 'unknown' })
    );
  });

  it('logs 4xx responses as warnings and 5xx as errors', () => {
    run(404);
    expect(warn).toHaveBeenCalledWith('HTTP Request', expect.objectContaining({ status: 404 }));

    run(503);
    expect(error).toHaveBeenCalledWith('HTTP Request', expect.objectContaining({ status: 503 }));
    expect(http).not.toHaveBeenCalled();
  });
});
