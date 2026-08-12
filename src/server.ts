import { app } from './app';
import { env } from './config/env';
import { prisma, disconnectDatabase } from './config/database';
import { logger } from './utils/logger';

// ─── Start Server ──────────────────────────────────────────────────────────────
async function startServer(): Promise<void> {
  // 1. Test database connectivity before accepting traffic
  let connected = false;
  let attempts = 0;
  while (!connected && attempts < 5) {
    try {
      attempts++;
      await prisma.$connect();
      logger.info('✅  Database connection established');
      connected = true;
    } catch (error) {
      logger.warn(
        `⚠️  Database connection attempt ${attempts} failed. Retrying in 2s...`,
        error
      );
      if (attempts >= 5) {
        logger.error('❌  Failed to connect to database after 5 attempts:', error);
        process.exit(1);
      }
      await new Promise((res) => setTimeout(res, 2000));
    }
  }

  // 2. Start HTTP server
  const host = '0.0.0.0';
  const server = app.listen(env.PORT, host, () => {
    logger.info('─────────────────────────────────────────────');
    logger.info(`🚀  ${env.APP_NAME} is running`);
    logger.info(`🌐  Environment : ${env.NODE_ENV}`);
    logger.info(`🔌  Port        : ${env.PORT}`);
    logger.info(`📡  API Base    : http://${host}:${env.PORT}/api/${env.API_VERSION}`);
    logger.info(`🏥  Health      : http://${host}:${env.PORT}/health`);
    if (env.NODE_ENV !== 'production') {
      logger.info(`📖  API Docs    : http://${host}:${env.PORT}/api-docs`);
    }
    logger.info('─────────────────────────────────────────────');
  });

  // ─── Graceful Shutdown ────────────────────────────────────────────────────────
  const shutdown = (signal: string, exitCode = 0): void => {
    logger.info(`\n📴  Received ${signal}. Shutting down gracefully...`);

    // Force exit if graceful shutdown does not complete in time
    const forceExitTimer = setTimeout(() => {
      logger.error('⚠️  Forced shutdown after timeout.');
      process.exit(1);
    }, 10_000);

    server.close((closeError) => {
      if (closeError) {
        logger.error('❌  Error while closing HTTP server:', closeError);
      }
      disconnectDatabase()
        .then(() => {
          logger.info('✅  Database disconnected. Process exiting.');
        })
        .catch((error: unknown) => {
          logger.error('❌  Failed to disconnect database during shutdown:', error);
          exitCode = 1;
        })
        .finally(() => {
          clearTimeout(forceExitTimer);
          process.exit(closeError ? 1 : exitCode);
        });
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  // ─── Server-level Errors (e.g. EADDRINUSE) ────────────────────────────────────
  server.on('error', (error: Error) => {
    logger.error('❌  HTTP server error:', error);
    process.exit(1);
  });

  // ─── Unhandled Rejection Guard ────────────────────────────────────────────────
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection:', reason);
    // Process state is undefined after an unobserved rejection: drain
    // connections and exit non-zero so the supervisor restarts it.
    shutdown('unhandledRejection', 1);
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
  });
}

startServer().catch((error: unknown) => {
  logger.error('❌  Fatal error during server startup:', error);
  process.exit(1);
});
