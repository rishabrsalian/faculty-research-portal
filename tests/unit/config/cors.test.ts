import { CorsOptions, CorsOptionsDelegate } from 'cors';

type OriginFn = Extract<CorsOptions['origin'], (...args: never[]) => unknown>;

/**
 * Loads a fresh copy of the CORS config with the given env, since the allowed
 * origin list is computed once at module load.
 */
const loadOriginChecker = (envOverrides: Record<string, string>): OriginFn => {
  let checker!: OriginFn;
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(envOverrides)) {
    previous[key] = process.env[key];
    process.env[key] = value;
  }
  jest.isolateModules(() => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { corsOptions } = require('../../../src/config/cors') as {
      corsOptions: CorsOptions & { origin: OriginFn };
    };
    checker = corsOptions.origin;
  });
  for (const [key, value] of Object.entries(previous)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  return checker;
};

const check = (origin: string | undefined, checker: OriginFn) => {
  const callback = jest.fn();
  (checker as unknown as CorsOptionsDelegate)(origin as never, callback as never);
  return callback;
};

const expectAllowed = (origin: string | undefined, checker: OriginFn) =>
  expect(check(origin, checker).mock.calls[0]).toEqual([null, true]);

const expectBlocked = (origin: string, checker: OriginFn) => {
  const error = check(origin, checker).mock.calls[0][0] as Error;
  expect(error).toBeInstanceOf(Error);
  expect(error.message).toContain(`Origin "${origin}" is not allowed`);
};

describe('corsOptions.origin (development / test)', () => {
  const checker = loadOriginChecker({
    NODE_ENV: 'test',
    CORS_ORIGINS: 'https://portal.example.edu/, https://alt.example.edu',
  });

  it('allows requests without an Origin header (curl, mobile apps)', () => {
    expectAllowed(undefined, checker);
  });

  it('allows any localhost or 127.0.0.1 port outside production', () => {
    expectAllowed('http://localhost:5173', checker);
    expectAllowed('https://127.0.0.1:8080', checker);
    expectAllowed('http://localhost', checker);
  });

  it('allows each configured origin, ignoring trailing slashes and whitespace', () => {
    expectAllowed('https://portal.example.edu', checker);
    expectAllowed('https://alt.example.edu', checker);
    expectAllowed('https://portal.example.edu/', checker);
  });

  it('blocks an origin that is not configured', () => {
    expectBlocked('https://evil.example.com', checker);
  });

  it('blocks a look-alike host and a scheme or port mismatch', () => {
    expectBlocked('https://portal.example.edu.evil.com', checker);
    expectBlocked('http://portal.example.edu', checker);
    expectBlocked('https://portal.example.edu:8443', checker);
  });
});

describe('corsOptions.origin (production)', () => {
  const checker = loadOriginChecker({
    NODE_ENV: 'production',
    CORS_ORIGINS: 'https://portal.example.edu',
  });

  it('no longer auto-allows localhost', () => {
    expectBlocked('http://localhost:5173', checker);
  });

  it('still allows the configured origin', () => {
    expectAllowed('https://portal.example.edu', checker);
  });
});

describe('corsOptions.origin with a wildcard', () => {
  it('allows every origin when CORS_ORIGINS contains "*"', () => {
    const checker = loadOriginChecker({ NODE_ENV: 'production', CORS_ORIGINS: '*' });
    expectAllowed('https://anything.example.com', checker);
  });
});
