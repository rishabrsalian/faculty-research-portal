import { app } from './app';
import { env } from './config/env';
import { prisma, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

// ─── Start Server ──────────────────────────────────────────────────────────────
async function startServer(): Promise<void> {
  // 1. Test database connectivity before accepting traffic
  try {
    await prisma.$connect();
    logger.info('✅  Database connection established');
  } catch (error) {
    logger.error('❌  Failed to connect to database:', error);
    process.exit(1);
  }

  // 2. Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info('─────────────────────────────────────────────');
    logger.info(`🚀  ${env.APP_NAME} is running`);
    logger.info(`🌐  Environment : ${env.NODE_ENV}`);
    logger.info(`🔌  Port        : ${env.PORT}`);
    logger.info(`📡  API Base    : http://localhost:${env.PORT}/api/${env.API_VERSION}`);
    logger.info(`🏥  Health      : http://localhost:${env.PORT}/health`);
    if (env.NODE_ENV !== 'production') {
      logger.info(`📖  API Docs    : http://localhost:${env.PORT}/api-docs`);
    }
    logger.info('─────────────────────────────────────────────');
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`\n📴  Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDatabase();
      logger.info('✅  Database disconnected. Process exiting.');
      process.exit(0);
    });

    // Force exit after 10 seconds if graceful shutdown fails
    setTimeout(() => {
      logger.error('⚠️  Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // ─── Unhandled Rejection Guard ────────────────────────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection:', reason);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

startServer();
