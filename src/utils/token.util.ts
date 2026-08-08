import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, TokenPair } from '../types/auth.types';

/**
 * Generates an access token (short-lived: 15 minutes).
 * Stored in memory on the client (not in localStorage or cookies).
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.expiresIn as string,
    issuer: 'faculty-research-portal',
    audience: 'frp-client',
  } as jwt.SignOptions);
}

/**
 * Generates a refresh token (long-lived: 7 days).
 * Stored in an HTTP-only secure cookie on the client.
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, jwtConfig.refresh.secret, {
    expiresIn: jwtConfig.refresh.expiresIn as string,
    issuer: 'faculty-research-portal',
    audience: 'frp-client',
  } as jwt.SignOptions);
}

/**
 * Generates both access and refresh tokens in a single call.
 * Used on login and registration.
 */
export function generateTokenPair(payload: JwtPayload): TokenPair {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}

/**
 * Verifies and decodes an access token.
 * Throws if the token is invalid or expired.
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.access.secret, {
    issuer: 'faculty-research-portal',
    audience: 'frp-client',
  }) as JwtPayload;
}

/**
 * Verifies and decodes a refresh token.
 * Throws if the token is invalid or expired.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, jwtConfig.refresh.secret, {
    issuer: 'faculty-research-portal',
    audience: 'frp-client',
  }) as JwtPayload;
}
