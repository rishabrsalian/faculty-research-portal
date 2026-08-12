import { AuthService } from '../../../src/services/auth.service';
import { AppError } from '../../../src/middleware/error.middleware';
import { prisma } from '../../../src/config/database';
import { hashPassword } from '../../../src/utils/password.util';
import {
  generateRefreshToken,
  generateAccessToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../../src/utils/token.util';

jest.mock('../../../src/config/database', () => ({
  prisma: {
    user: { findUnique: jest.fn(), update: jest.fn() },
  },
}));

const findUnique = prisma.user.findUnique as jest.Mock;
const update = prisma.user.update as jest.Mock;

const service = new AuthService();
let passwordHash: string;

const dbUser = () => ({
  id: 'user-1',
  email: 'faculty@example.edu',
  password: passwordHash,
  role: 'FACULTY' as const,
  isActive: true,
  facultyProfile: { id: 'faculty-1' },
});

beforeAll(async () => {
  passwordHash = await hashPassword('correct-horse');
});

beforeEach(() => {
  findUnique.mockReset();
  update.mockReset();
  update.mockResolvedValue({});
});

describe('AuthService.login', () => {
  it('returns the user without the password hash plus a token pair', async () => {
    findUnique.mockResolvedValue(dbUser());

    const { user, tokens } = await service.login('faculty@example.edu', 'correct-horse');

    expect(user).not.toHaveProperty('password');
    expect(user).toMatchObject({ id: 'user-1', facultyProfile: { id: 'faculty-1' } });
    expect(verifyAccessToken(tokens.accessToken)).toMatchObject({
      userId: 'user-1',
      sub: 'user-1',
      email: 'faculty@example.edu',
      role: 'FACULTY',
    });
    expect(verifyRefreshToken(tokens.refreshToken)).toMatchObject({ sub: 'user-1' });
  });

  it('stamps lastLogin on success', async () => {
    findUnique.mockResolvedValue(dbUser());
    await service.login('faculty@example.edu', 'correct-horse');

    expect(update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { lastLogin: expect.any(Date) },
    });
  });

  it('rejects an unknown email with a generic 401', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.login('nobody@example.edu', 'x')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    });
    expect(update).not.toHaveBeenCalled();
  });

  it('rejects a deactivated account', async () => {
    findUnique.mockResolvedValue({ ...dbUser(), isActive: false });
    await expect(service.login('faculty@example.edu', 'correct-horse')).rejects.toBeInstanceOf(
      AppError
    );
  });

  it('rejects a wrong password without updating lastLogin', async () => {
    findUnique.mockResolvedValue(dbUser());
    await expect(service.login('faculty@example.edu', 'wrong')).rejects.toMatchObject({
      statusCode: 401,
      message: 'Invalid email or password',
    });
    expect(update).not.toHaveBeenCalled();
  });
});

describe('AuthService.refreshToken', () => {
  const validRefresh = () =>
    generateRefreshToken({
      userId: 'user-1',
      sub: 'user-1',
      email: 'faculty@example.edu',
      role: 'FACULTY',
    });

  it('issues a rotated token pair for an active user', async () => {
    findUnique.mockResolvedValue({
      id: 'user-1',
      email: 'faculty@example.edu',
      role: 'FACULTY',
      isActive: true,
    });

    const tokens = await service.refreshToken(validRefresh());

    expect(verifyAccessToken(tokens.accessToken)).toMatchObject({ sub: 'user-1' });
    expect(verifyRefreshToken(tokens.refreshToken)).toMatchObject({ sub: 'user-1' });
  });

  it('rejects a missing token with a 400', async () => {
    await expect(service.refreshToken('')).rejects.toMatchObject({
      statusCode: 400,
      message: 'Refresh token is required',
    });
    expect(findUnique).not.toHaveBeenCalled();
  });

  it('rejects an access token presented as a refresh token', async () => {
    const accessToken = generateAccessToken({
      userId: 'user-1',
      sub: 'user-1',
      email: 'faculty@example.edu',
      role: 'FACULTY',
    });
    await expect(service.refreshToken(accessToken)).rejects.toThrow();
  });

  it('rejects a token belonging to a deleted or deactivated user', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.refreshToken(validRefresh())).rejects.toMatchObject({ statusCode: 401 });

    findUnique.mockResolvedValue({ id: 'user-1', isActive: false });
    await expect(service.refreshToken(validRefresh())).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('AuthService.getMe', () => {
  it('returns the profile without the password hash', async () => {
    findUnique.mockResolvedValue(dbUser());
    const user = await service.getMe('user-1');
    expect(user).not.toHaveProperty('password');
    expect(user).toMatchObject({ id: 'user-1', email: 'faculty@example.edu' });
  });

  it('throws a 404 when the user does not exist', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.getMe('ghost')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });
});
