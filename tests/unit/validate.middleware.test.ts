import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

import { validate } from '../../src/middleware/validate.middleware';

const schema = z.object({
  body: z.object({ email: z.string().email(), password: z.string().min(8) }),
});

describe('validate', () => {
  const res = {} as Response;
  let next: NextFunction;

  beforeEach(() => {
    next = jest.fn();
  });

  it('calls next without an error for a valid payload', async () => {
    const req = { body: { email: 'a@b.com', password: 'password123' } } as Request;

    await validate(schema)(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('forwards the ZodError so field-level details survive', async () => {
    const req = { body: { email: 'nope', password: 'short' } } as Request;

    await validate(schema)(req, res, next);

    const forwarded = (next as jest.Mock).mock.calls[0][0];
    expect(forwarded).toBeInstanceOf(ZodError);
    expect((forwarded as ZodError).errors.map((e) => e.path.join('.'))).toEqual([
      'body.email',
      'body.password',
    ]);
  });
});
