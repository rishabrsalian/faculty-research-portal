import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

// ─── Log Format for Console (Human-readable) ───────────────────────────────────
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${level}: ${stack || message} ${metaStr}`;
  })
);

// ─── Log Format for Files (JSON — structured for log aggregators) ──────────────
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ─── Transports ────────────────────────────────────────────────────────────────
const transports: winston.transport[] = [
  // Console — always on in development
  new winston.transports.Console({
    format: consoleFormat,
    silent: env.NODE_ENV === 'test', // Suppress logs during tests
  }),
];

// File transports — only in non-test environments
if (env.NODE_ENV !== 'test') {
  transports.push(
    // All logs: info and above
    new DailyRotateFile({
      filename: path.join(env.LOG_DIR, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: fileFormat,
      level: 'info',
    }),
    // Error logs only
    new DailyRotateFile({
      filename: path.join(env.LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d',
      format: fileFormat,
      level: 'error',
    })
  );
}

// ─── Logger Instance ───────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  transports,
  // Prevent Winston from crashing if an uncaughtException occurs
  exitOnError: false,
});

export default logger;
