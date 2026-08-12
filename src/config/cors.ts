import { CorsOptions } from 'cors';
import { env } from './env';
import { logger } from '../utils/logger';

/**
 * CORS Configuration
 *
 * Reads allowed origins from the CORS_ORIGINS environment variable
 * (comma-separated list). Supports credentials (cookies for refresh tokens).
 */
const configuredOrigins: string[] = env.CORS_ORIGINS.split(',')
  .map((o) => o.trim().replace(/\/+$/, ''))
  .filter(Boolean);

/**
 * Allow-list resolved to bare origins once at startup. Entries that are neither
 * `*` nor parseable as a URL are reported instead of being silently treated as
 * "not allowed" on every request.
 */
const allowedOrigins: string[] = configuredOrigins.flatMap((allowed) => {
  if (allowed === '*') return [allowed];
  try {
    return [new URL(allowed).origin];
  } catch (error) {
    logger.warn(
      `Ignoring malformed entry "${allowed}" in CORS_ORIGINS: ${(error as Error).message}`
    );
    return [];
  }
});

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman, curl, same-origin)
    if (!origin) return callback(null, true);

    // In development mode, automatically allow any localhost / 127.0.0.1 port
    if (env.NODE_ENV !== 'production') {
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
    }

    const normalizedOrigin = origin.replace(/\/+$/, '');

    const isAllowed = allowedOrigins.some(
      (allowed) => allowed === '*' || allowed === normalizedOrigin
    );

    if (isAllowed) {
      return callback(null, true);
    }

    callback(new Error(`CORS policy: Origin "${origin}" is not allowed.`));
  },
  credentials: true, // Allow cookies (for refresh token HttpOnly cookie)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'],
  maxAge: 86400, // Pre-flight cache: 24 hours
};
