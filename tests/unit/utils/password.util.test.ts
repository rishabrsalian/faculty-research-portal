import { hashPassword, comparePassword } from '../../../src/utils/password.util';

describe('password util', () => {
  const plain = 'S3cur3-P@ssword';

  it('produces a bcrypt hash with 12 salt rounds that differs from the input', async () => {
    const hash = await hashPassword(plain);
    expect(hash).not.toBe(plain);
    expect(hash).toMatch(/^\$2[aby]\$12\$/);
  });

  it('produces a different hash each time due to random salting', async () => {
    const [first, second] = await Promise.all([hashPassword(plain), hashPassword(plain)]);
    expect(first).not.toBe(second);
  });

  it('accepts the correct password and rejects an incorrect one', async () => {
    const hash = await hashPassword(plain);
    await expect(comparePassword(plain, hash)).resolves.toBe(true);
    await expect(comparePassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('returns false for a malformed hash instead of throwing', async () => {
    await expect(comparePassword(plain, 'not-a-bcrypt-hash')).resolves.toBe(false);
  });
});
