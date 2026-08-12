import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
} from '../../../src/utils/token.util';
import { jwtConfig } from '../../../src/config/jwt';
import { JwtPayload } from '../../../src/types/auth.types';

const payload: JwtPayload = {
  userId: 'user-1',
  sub: 'user-1',
  email: 'faculty@example.edu',
  role: 'FACULTY',
};

describe('token util', () => {
  it('signs access tokens with the issuer and audience claims', () => {
    const decoded = jwt.decode(generateAccessToken(payload)) as Record<string, unknown>;
    expect(decoded).toMatchObject({
      userId: 'user-1',
      email: 'faculty@example.edu',
      role: 'FACULTY',
      iss: 'faculty-research-portal',
      aud: 'frp-client',
    });
    expect(decoded['exp']).toBeGreaterThan(decoded['iat'] as number);
  });

  it('round-trips an access token', () => {
    const verified = verifyAccessToken(generateAccessToken(payload));
    expect(verified).toMatchObject(payload);
  });

  it('round-trips a refresh token', () => {
    const verified = verifyRefreshToken(generateRefreshToken(payload));
    expect(verified).toMatchObject(payload);
  });

  it('returns both tokens from generateTokenPair', () => {
    const pair = generateTokenPair(payload);
    expect(verifyAccessToken(pair.accessToken)).toMatchObject(payload);
    expect(verifyRefreshToken(pair.refreshToken)).toMatchObject(payload);
  });

  it('uses separate secrets for access and refresh tokens', () => {
    expect(() => verifyAccessToken(generateRefreshToken(payload))).toThrow(jwt.JsonWebTokenError);
    expect(() => verifyRefreshToken(generateAccessToken(payload))).toThrow(jwt.JsonWebTokenError);
  });

  it('rejects a malformed token', () => {
    expect(() => verifyAccessToken('garbage.token.value')).toThrow(jwt.JsonWebTokenError);
  });

  it('rejects an expired token', () => {
    const expired = jwt.sign(payload, jwtConfig.access.secret, {
      expiresIn: '-1s',
      issuer: 'faculty-research-portal',
      audience: 'frp-client',
    });
    expect(() => verifyAccessToken(expired)).toThrow(jwt.TokenExpiredError);
  });

  it('rejects a token signed with the right secret but the wrong audience', () => {
    const wrongAudience = jwt.sign(payload, jwtConfig.access.secret, {
      expiresIn: '15m',
      issuer: 'faculty-research-portal',
      audience: 'someone-else',
    });
    expect(() => verifyAccessToken(wrongAudience)).toThrow(jwt.JsonWebTokenError);
  });
});
