const constructorSpy = jest.fn();
const disconnectSpy = jest.fn().mockResolvedValue(undefined);

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    $disconnect = disconnectSpy;
    constructor(options: unknown) {
      constructorSpy(options);
    }
  },
}));

type DatabaseModule = typeof import('../../../src/config/database');

const load = (nodeEnv: string): DatabaseModule => {
  const previous = process.env['NODE_ENV'];
  process.env['NODE_ENV'] = nodeEnv;
  let mod!: DatabaseModule;
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    mod = require('../../../src/config/database') as DatabaseModule;
  });
  process.env['NODE_ENV'] = previous;
  return mod;
};

beforeEach(() => {
  delete (globalThis as { __prisma?: unknown }).__prisma;
  constructorSpy.mockClear();
  disconnectSpy.mockClear();
});

describe('prisma client singleton', () => {
  it('logs only errors and caches the instance on globalThis outside production', () => {
    const { prisma } = load('development');

    expect(constructorSpy).toHaveBeenCalledTimes(1);
    expect(constructorSpy.mock.calls[0][0]).toMatchObject({ errorFormat: 'pretty' });
    expect((globalThis as { __prisma?: unknown }).__prisma).toBe(prisma);
  });

  it('reuses an existing global instance instead of opening a second connection', () => {
    const existing = { marker: 'reused' };
    (globalThis as { __prisma?: unknown }).__prisma = existing;

    const { prisma } = load('development');

    expect(prisma).toBe(existing);
    expect(constructorSpy).not.toHaveBeenCalled();
  });

  it('does not cache the client on globalThis in production', () => {
    load('production');
    expect(constructorSpy).toHaveBeenCalledTimes(1);
    expect((globalThis as { __prisma?: unknown }).__prisma).toBeUndefined();
  });

  it('enables verbose query logging only in development', () => {
    load('development');
    expect(constructorSpy.mock.calls[0][0]).toMatchObject({
      log: ['query', 'info', 'warn', 'error'],
    });

    constructorSpy.mockClear();
    delete (globalThis as { __prisma?: unknown }).__prisma;
    load('production');
    expect(constructorSpy.mock.calls[0][0]).toMatchObject({ log: ['error'] });
  });

  it('disconnectDatabase closes the connection', async () => {
    const { disconnectDatabase } = load('development');
    await disconnectDatabase();
    expect(disconnectSpy).toHaveBeenCalledTimes(1);
  });
});
