import { z } from 'zod';
import { validate } from '../../../src/middleware/validate.middleware';
import { AppError } from '../../../src/middleware/error.middleware';
import { mockRequest, mockResponse } from '../../helpers/express';

const schema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    year: z.number().int(),
  }),
});

const run = async (schemaToUse: Parameters<typeof validate>[0], req = mockRequest()) => {
  const next = jest.fn();
  await validate(schemaToUse)(req, mockResponse(), next);
  return next;
};

describe('validate', () => {
  it('calls next with no arguments for a valid payload', async () => {
    const req = mockRequest({ body: { title: 'Graph Neural Networks', year: 2024 } });
    const next = await run(schema, req);
    expect(next).toHaveBeenCalledWith();
  });

  it('validates query, params and cookies together with the body', async () => {
    const composite = z.object({
      query: z.object({ page: z.string() }),
      params: z.object({ id: z.string().uuid() }),
      cookies: z.object({ refreshToken: z.string() }),
    });
    const req = mockRequest({
      query: { page: '2' },
      params: { id: '3f0c2f4a-1e5f-4e02-9c11-2f8a44e1f0aa' },
      cookies: { refreshToken: 'token' },
    } as never);
    expect(await run(composite, req)).toHaveBeenCalledWith();
  });

  it('converts a ZodError into a 400 AppError listing every field', async () => {
    const req = mockRequest({ body: { title: '', year: 'not-a-number' } });
    const next = await run(schema, req);

    const error = next.mock.calls[0][0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(400);
    expect(error.message).toContain('body.title: Title is required');
    expect(error.message).toContain('body.year:');
  });

  it('forwards non-Zod errors untouched', async () => {
    const boom = new Error('async refinement blew up');
    const failing = z.object({}).superRefine(() => {
      throw boom;
    }) as unknown as Parameters<typeof validate>[0];

    const next = await run(failing);
    expect(next).toHaveBeenCalledWith(boom);
  });
});
