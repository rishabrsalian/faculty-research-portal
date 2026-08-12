import {
  loginSchema,
  refreshTokenSchema,
  updatePasswordSchema,
} from '../../../src/validation/auth.schema';

const messages = (result: { success: boolean; error?: { errors: { message: string }[] } }) =>
  result.error!.errors.map((e) => e.message);

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(
      loginSchema.safeParse({ body: { email: 'faculty@example.edu', password: 'secret1' } }).success
    ).toBe(true);
  });

  it('rejects a malformed email', () => {
    const result = loginSchema.safeParse({ body: { email: 'nope', password: 'secret1' } });
    expect(result.success).toBe(false);
    expect(messages(result)).toContain('Invalid email address');
  });

  it('rejects a password shorter than 6 characters', () => {
    const result = loginSchema.safeParse({ body: { email: 'a@b.co', password: '12345' } });
    expect(messages(result)).toContain('Password must be at least 6 characters');
  });

  it('reports both fields as required when the body is empty', () => {
    const result = loginSchema.safeParse({ body: {} });
    expect(messages(result)).toEqual(
      expect.arrayContaining(['Email is required', 'Password is required'])
    );
  });
});

describe('refreshTokenSchema', () => {
  it('requires a refreshToken cookie', () => {
    expect(refreshTokenSchema.safeParse({ cookies: { refreshToken: 'abc' } }).success).toBe(true);
    expect(messages(refreshTokenSchema.safeParse({ cookies: {} }))).toContain(
      'Refresh token is missing'
    );
  });
});

describe('updatePasswordSchema', () => {
  it('accepts a different new password', () => {
    expect(
      updatePasswordSchema.safeParse({
        body: { currentPassword: 'old-password', newPassword: 'new-password' },
      }).success
    ).toBe(true);
  });

  it('rejects reusing the current password', () => {
    const result = updatePasswordSchema.safeParse({
      body: { currentPassword: 'same-password', newPassword: 'same-password' },
    });
    expect(result.success).toBe(false);
    expect(result.error!.errors[0]!.path).toEqual(['body', 'newPassword']);
    expect(messages(result)).toContain('New password must be different from current password');
  });

  it('rejects a short new password', () => {
    expect(
      messages(
        updatePasswordSchema.safeParse({ body: { currentPassword: 'old-password', newPassword: 'abc' } })
      )
    ).toContain('Password must be at least 6 characters');
  });
});
