import { AuthController } from '../../../src/controllers/auth.controller';
import { authService } from '../../../src/services/auth.service';
import { env } from '../../../src/config/env';
import { mockRequest, mockResponse, jsonBody } from '../../helpers/express';

jest.mock('../../../src/services/auth.service', () => ({
  authService: {
    login: jest.fn(),
    refreshToken: jest.fn(),
    getMe: jest.fn(),
  },
}));

const service = authService as jest.Mocked<typeof authService>;
const controller = new AuthController();

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: false,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

beforeEach(() => jest.clearAllMocks());

describe('AuthController.login', () => {
  beforeEach(() => {
    service.login.mockResolvedValue({
      user: { id: 'user-1' },
      tokens: { accessToken: 'access', refreshToken: 'refresh' },
    });
  });

  it('returns the user and access token in the body', async () => {
    const res = mockResponse();

    await controller.login(mockRequest({ body: { email: 'a@b.co', password: 'secret1' } }), res);

    expect(service.login).toHaveBeenCalledWith('a@b.co', 'secret1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(jsonBody(res)).toMatchObject({
      success: true,
      message: 'Login successful',
      data: { user: { id: 'user-1' }, accessToken: 'access' },
    });
  });

  it('keeps the refresh token in an httpOnly cookie and out of the body', async () => {
    const res = mockResponse();

    await controller.login(mockRequest({ body: { email: 'a@b.co', password: 'secret1' } }), res);

    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'refresh', REFRESH_COOKIE_OPTIONS);
    expect(JSON.stringify(jsonBody(res))).not.toContain('refresh');
  });

  it('marks the cookie secure in production', async () => {
    const nodeEnv = env.NODE_ENV;
    (env as { NODE_ENV: string }).NODE_ENV = 'production';
    const res = mockResponse();
    try {
      await controller.login(mockRequest({ body: { email: 'a@b.co', password: 'secret1' } }), res);
      expect(res.cookie).toHaveBeenCalledWith(
        'refreshToken',
        'refresh',
        expect.objectContaining({ secure: true })
      );
    } finally {
      (env as { NODE_ENV: string }).NODE_ENV = nodeEnv;
    }
  });

  it('propagates a failed login', async () => {
    service.login.mockRejectedValue(new Error('Invalid email or password'));
    const res = mockResponse();

    await expect(
      controller.login(mockRequest({ body: { email: 'a@b.co', password: 'bad' } }), res)
    ).rejects.toThrow('Invalid email or password');
    expect(res.cookie).not.toHaveBeenCalled();
  });
});

describe('AuthController.refresh', () => {
  it('rotates the refresh cookie and returns a new access token', async () => {
    service.refreshToken.mockResolvedValue({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    const res = mockResponse();

    await controller.refresh(mockRequest({ cookies: { refreshToken: 'old' } } as never), res);

    expect(service.refreshToken).toHaveBeenCalledWith('old');
    expect(res.cookie).toHaveBeenCalledWith('refreshToken', 'new-refresh', REFRESH_COOKIE_OPTIONS);
    expect(jsonBody(res)).toMatchObject({
      message: 'Token refreshed',
      data: { accessToken: 'new-access' },
    });
  });
});

describe('AuthController.logout', () => {
  it('clears the refresh cookie', async () => {
    const res = mockResponse();

    await controller.logout(mockRequest(), res);

    expect(res.clearCookie).toHaveBeenCalledWith('refreshToken', {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
    });
    expect(jsonBody(res)).toMatchObject({ message: 'Logout successful', data: null });
  });
});

describe('AuthController.getMe', () => {
  it('fetches the profile of the authenticated user', async () => {
    service.getMe.mockResolvedValue({ id: 'user-1' } as never);
    const req = mockRequest({
      user: { userId: 'user-1', sub: 'user-1', email: 'a@b.co', role: 'FACULTY' },
    } as never);
    const res = mockResponse();

    await controller.getMe(req, res);

    expect(service.getMe).toHaveBeenCalledWith('user-1');
    expect(jsonBody(res)).toMatchObject({
      message: 'Profile fetched successfully',
      data: { id: 'user-1' },
    });
  });
});
