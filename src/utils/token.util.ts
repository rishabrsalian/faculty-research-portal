import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, TokenPair } from '../types/auth.types';

/** Issuer/audience claims applied to every token this service signs and verifies. */
const tokenClaims = {
  issuer: 'faculty-research-portal',
  audience: 'frp-client',
} as const;

function signToken(payload: JwtPayload, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { ...tokenClaims, expiresIn } as jwt.SignOptions);
}

function verifyToken(token: string, secret: string): JwtPayload {
  return jwt.verify(token, secret, tokenClaims) as JwtPayload;
}

/**
 * Generates an access token (short-lived: 15 minutes).
 * Stored in memory on the client (not in localStorage or cookies).
 */
export function generateAccessToken(payload: JwtPayload): string {
  return signToken(payload, jwtConfig.access.secret, jwtConfig.access.expiresIn as string);
}

/**
 * Generates a refresh token (long-lived: 7 days).
 * Stored in an HTTP-only secure cookie on the client.
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return signToken(payload, jwtConfig.refresh.secret, jwtConfig.refresh.expiresIn as string);
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
  return verifyToken(token, jwtConfig.access.secret);
}

/**
 * Verifies and decodes a refresh token.
 * Throws if the token is invalid or expired.
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return verifyToken(token, jwtConfig.refresh.secret);
}
