import 'express-async-errors';
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';

// Config
import { corsOptions } from './config/cors';
import { env } from './config/env';

// Routes
import { apiRouter } from './routes/index';

// Middleware
import { errorHandler } from './middleware/error.middleware';
import { httpLogger } from './middleware/logger.middleware';

// Utils
import { logger } from './utils/logger';
import { swaggerSpec } from './docs/swagger';


// ─── Application Setup ─────────────────────────────────────────────────────────
const app: Application = express();

// ─── Trust Proxy (required if behind Nginx / load balancer) ───────────────────
app.set('trust proxy', 1);

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
    timestamp: new Date().toISOString(),
  },
});
app.use('/api', globalLimiter);

// ─── Body Parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(env.COOKIE_SECRET));

// ─── Compression ───────────────────────────────────────────────────────────────
app.use(compression());

// ─── HTTP Request Logging ──────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
}
app.use(httpLogger);

// ─── API Documentation (Swagger UI) ───────────────────────────────────────────
if (env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: 'Faculty Research Portal — API Docs',
  }));
  logger.info(`📖 Swagger docs available at http://localhost:${env.PORT}/api-docs`);
}

// ─── Health Check (no auth required) ──────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Faculty Research Portal API is running',
    environment: env.NODE_ENV,
    version: env.API_VERSION,
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use(`/api/${env.API_VERSION}`, apiRouter);

// ─── 404 Handler ───────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route not found`,
    code: 'NOT_FOUND',
    timestamp: new Date().toISOString(),
  });
});

// ─── Centralized Error Handler ────────────────────────────────────────────────
app.use(errorHandler);

export { app };
