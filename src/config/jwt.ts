import { env } from './env';

/**
 * JWT Configuration
 *
 * Centralizes all JWT-related constants.
 * Used by token utilities and auth middleware.
 */
export const jwtConfig = {
  access: {
    secret: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  },
  refresh: {
    secret: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  },
  /**
   * HTTP-only cookie settings for the refresh token.
   * Secure = true in production (requires HTTPS).
   */
  cookieOptions: {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  },
} as const;
