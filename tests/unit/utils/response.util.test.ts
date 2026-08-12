import { sendSuccess, sendError, respond } from '../../../src/utils/response.util';
import { PaginationMeta } from '../../../src/types/api.types';
import { mockResponse, jsonBody, MockResponse } from '../../helpers/express';

const pagination: PaginationMeta = {
  page: 1,
  limit: 20,
  total: 1,
  totalPages: 1,
  hasNext: false,
  hasPrev: false,
};

describe('sendSuccess', () => {
  let res: MockResponse;
  beforeEach(() => {
    res = mockResponse();
  });

  it('defaults to status 200 with a generic message and no pagination key', () => {
    sendSuccess(res, { id: 'p1' });
    expect(res.status).toHaveBeenCalledWith(200);
    const body = jsonBody(res);
    expect(body).toMatchObject({ success: true, message: 'Success', data: { id: 'p1' } });
    expect(body).not.toHaveProperty('pagination');
    expect(typeof body['timestamp']).toBe('string');
  });

  it('includes pagination metadata when provided', () => {
    sendSuccess(res, [], 'Listed', 200, pagination);
    expect(jsonBody(res)['pagination']).toEqual(pagination);
  });

  it('honours a custom status code', () => {
    sendSuccess(res, null, 'Created', 201);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});

describe('sendError', () => {
  let res: MockResponse;
  beforeEach(() => {
    res = mockResponse();
  });

  it('defaults to a 500 INTERNAL_SERVER_ERROR', () => {
    sendError(res, 'boom');
    expect(res.status).toHaveBeenCalledWith(500);
    expect(jsonBody(res)).toMatchObject({
      success: false,
      message: 'boom',
      code: 'INTERNAL_SERVER_ERROR',
    });
  });

  it('includes field errors only when the array is non-empty', () => {
    sendError(res, 'invalid', 422, 'VALIDATION_ERROR', [{ field: 'email', message: 'required' }]);
    expect(jsonBody(res)['errors']).toEqual([{ field: 'email', message: 'required' }]);

    const empty = mockResponse();
    sendError(empty, 'invalid', 422, 'VALIDATION_ERROR', []);
    expect(jsonBody(empty)).not.toHaveProperty('errors');
  });
});

describe('respond helpers', () => {
  it.each([
    ['badRequest', 400, 'BAD_REQUEST'],
    ['unauthorized', 401, 'UNAUTHORIZED'],
    ['forbidden', 403, 'FORBIDDEN'],
    ['notFound', 404, 'NOT_FOUND'],
    ['conflict', 409, 'CONFLICT'],
    ['serverError', 500, 'INTERNAL_SERVER_ERROR'],
  ])('%s maps to HTTP %i with code %s', (helper, status, code) => {
    const res = mockResponse();
    (respond as unknown as Record<string, (r: MockResponse, m: string) => void>)[helper]!(
      res,
      'message'
    );
    expect(res.status).toHaveBeenCalledWith(status);
    expect(jsonBody(res)).toMatchObject({ success: false, code });
  });

  it('uses default messages for unauthorized, forbidden and notFound', () => {
    const unauthorized = mockResponse();
    respond.unauthorized(unauthorized);
    expect(jsonBody(unauthorized)['message']).toBe('Authentication required');

    const forbidden = mockResponse();
    respond.forbidden(forbidden);
    expect(jsonBody(forbidden)['message']).toBe('Access denied');

    const notFound = mockResponse();
    respond.notFound(notFound);
    expect(jsonBody(notFound)['message']).toBe('Resource not found');
  });

  it('ok returns 200 with pagination support and created returns 201', () => {
    const ok = mockResponse();
    respond.ok(ok, [1, 2], undefined, pagination);
    expect(ok.status).toHaveBeenCalledWith(200);
    expect(jsonBody(ok)).toMatchObject({ message: 'OK', pagination });

    const created = mockResponse();
    respond.created(created, { id: 'x' });
    expect(created.status).toHaveBeenCalledWith(201);
    expect(jsonBody(created)['message']).toBe('Created successfully');
  });

  it('noContent sends an empty 204 body', () => {
    const res = mockResponse();
    respond.noContent(res);
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalledWith();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('validationError returns 422 with the field errors', () => {
    const res = mockResponse();
    respond.validationError(res, [{ field: 'year', message: 'too small' }]);
    expect(res.status).toHaveBeenCalledWith(422);
    expect(jsonBody(res)).toMatchObject({
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      errors: [{ field: 'year', message: 'too small' }],
    });
  });
});
