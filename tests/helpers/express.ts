import { Request, Response } from 'express';

export interface MockResponse extends Response {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  cookie: jest.Mock;
  clearCookie: jest.Mock;
}

/**
 * Minimal chainable Express Response double capturing status/json/send calls.
 */
export function mockResponse(): MockResponse {
  const res = {} as MockResponse;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  res.clearCookie = jest.fn().mockReturnValue(res);
  return res;
}

export function mockRequest(overrides: Partial<Request> = {}): Request {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    ...overrides,
  } as Request;
}

/** Returns the single body passed to `res.json`. */
export function jsonBody(res: MockResponse): Record<string, unknown> {
  expect(res.json).toHaveBeenCalledTimes(1);
  return res.json.mock.calls[0][0];
}
