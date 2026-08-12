import jwt from 'jsonwebtoken';
import { protect } from '../../../src/middleware/auth.middleware';
import { AppError } from '../../../src/middleware/error.middleware';
import { generateAccessToken } from '../../../src/utils/token.util';
import { prisma } from '../../../src/config/database';
import { mockRequest, mockResponse } from '../../helpers/express';

jest.mock('../../../src/config/database', () => ({
  prisma: { user: { findUnique: jest.fn() } },
}));

const findUnique = prisma.user.findUnique as jest.Mock;

const activeUser = {
  id: 'user-1',
  email: 'faculty@example.edu',
  role: 'FACULTY',
  isActive: true,
};

const token = generateAccessToken({
  userId: 'user-1',
  sub: 'user-1',
  email: 'faculty@example.edu',
  role: 'FACULTY',
});

const run = async (req = mockRequest()) => {
  const next = jest.fn();
  await protect(req, mockResponse(), next);
  return next;
};

describe('protect', () => {
  beforeEach(() => {
    findUnique.mockReset();
  });

  it('attaches the current user from a Bearer token', async () => {
    findUnique.mockResolvedValue(activeUser);
    const req = mockRequest({ headers: { authorization: `Bearer ${token}` } });

    const next = await run(req);

    expect(findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-1' } })
    );
    expect(req.user).toEqual({
      userId: 'user-1',
      sub: 'user-1',
      email: 'faculty@example.edu',
      role: 'FACULTY',
    });
    expect(next).toHaveBeenCalledWith();
  });

  it('falls back to the accessToken cookie when no Authorization header is present', async () => {
    findUnique.mockResolvedValue(activeUser);
    const req = mockRequest({ cookies: { accessToken: token } } as never);

    expect(await run(req)).toHaveBeenCalledWith();
    expect(req.user?.sub).toBe('user-1');
  });

  it('rejects a request with no token', async () => {
    const next = await run();
    const error = next.mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(401);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects a non-Bearer Authorization header', async () => {
    const next = await run(mockRequest({ headers: { authorization: 'Basic abc' } }));
    expect((next.mock.calls[0][0] as AppError).statusCode).toBe(401);
  });

  it('forwards verification failures for an invalid token', async () => {
    const next = await run(mockRequest({ headers: { authorization: 'Bearer not.a.token' } }));
    expect(next.mock.calls[0][0]).toBeInstanceOf(jwt.JsonWebTokenError);
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects a token whose user no longer exists', async () => {
    findUnique.mockResolvedValue(null);
    const next = await run(mockRequest({ headers: { authorization: `Bearer ${token}` } }));

    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('does no longer exist');
  });

  it('rejects a deactivated user with a 403', async () => {
    findUnique.mockResolvedValue({ ...activeUser, isActive: false });
    const next = await run(mockRequest({ headers: { authorization: `Bearer ${token}` } }));

    const error = next.mock.calls[0][0] as AppError;
    expect(error.statusCode).toBe(403);
    expect(error.message).toContain('deactivated');
  });

  it('forwards database failures to the error handler', async () => {
    const dbError = new Error('connection refused');
    findUnique.mockRejectedValue(dbError);
    const next = await run(mockRequest({ headers: { authorization: `Bearer ${token}` } }));
    expect(next).toHaveBeenCalledWith(dbError);
  });
});
