import { PrismaClient } from '@prisma/client';
import { env } from './env';

/**
 * Prisma Client Singleton
 *
 * In development, Next.js / tsx watch reloads the module multiple times.
 * We store the instance on `globalThis` to prevent creating multiple
 * connections during hot-reloads.
 *
 * In production, a fresh instance is created once per process lifetime.
 */
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    errorFormat: 'pretty',
  });
}

export const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

/**
 * Gracefully disconnect Prisma on process termination.
 * Called from server.ts on SIGINT / SIGTERM.
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
