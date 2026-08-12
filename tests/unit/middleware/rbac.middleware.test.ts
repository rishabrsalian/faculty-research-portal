import { Role } from '@prisma/client';
import { restrictTo } from '../../../src/middleware/rbac.middleware';
import { AppError } from '../../../src/middleware/error.middleware';
import { mockRequest, mockResponse } from '../../helpers/express';

const run = (roles: Role[], user?: { role: string }) => {
  const next = jest.fn();
  const req = mockRequest();
  if (user) {
    req.user = { userId: 'u1', sub: 'u1', email: 'a@b.c', role: user.role as 'ADMIN' | 'FACULTY' };
  }
  restrictTo(...roles)(req, mockResponse(), next);
  return next;
};

describe('restrictTo', () => {
  it('allows a user whose role is listed', () => {
    const next = run([Role.ADMIN], { role: 'ADMIN' });
    expect(next).toHaveBeenCalledWith();
  });

  it('allows any of several permitted roles', () => {
    const next = run([Role.ADMIN, Role.FACULTY], { role: 'FACULTY' });
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a user whose role is not listed with a 403', () => {
    const next = run([Role.ADMIN], { role: 'FACULTY' });
    const error = next.mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(403);
    expect(error.message).toBe('You do not have permission to perform this action');
  });

  it('rejects an unauthenticated request', () => {
    const next = run([Role.FACULTY]);
    expect((next.mock.calls[0][0] as AppError).statusCode).toBe(403);
  });

  it('rejects everyone when no roles are permitted', () => {
    const next = run([], { role: 'ADMIN' });
    expect((next.mock.calls[0][0] as AppError).statusCode).toBe(403);
  });
});
