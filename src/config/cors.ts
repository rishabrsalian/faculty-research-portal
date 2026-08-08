import { CorsOptions } from 'cors';
import { env } from './env';

/**
 * CORS Configuration
 *
 * Reads allowed origins from the CORS_ORIGINS environment variable
 * (comma-separated list). Supports credentials (cookies for refresh tokens).
 */
const allowedOrigins: string[] = env.CORS_ORIGINS.split(',').map((o) =>
  o.trim()
);

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
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
