import { Request } from 'express';

/**
 * JWT payload structure — embedded in every access token.
 */
export interface JwtPayload {
  sub: string;   // User UUID
  email: string;
  role: 'FACULTY' | 'ADMIN';
  iat?: number;  // Issued at (auto-set by jsonwebtoken)
  exp?: number;  // Expiry (auto-set by jsonwebtoken)
}

/**
 * Extends Express Request to include the authenticated user.
 * Populated by the auth middleware after JWT verification.
 */
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

/**
 * Token pair returned on login / refresh.
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
