import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './error.middleware';

/**
 * Middleware to validate incoming request data against a Zod schema.
 *
 * The parsed (and therefore whitelisted) result replaces the request data, so
 * handlers and Prisma writes only ever see fields declared in the schema.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });

      const { body, query, params } = parsed as {
        body?: unknown;
        query?: unknown;
        params?: unknown;
      };

      if (body !== undefined) req.body = body;
      if (query !== undefined) req.query = query as Request['query'];
      if (params !== undefined) req.params = params as Request['params'];

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format Zod errors into a readable structure
        const message = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return next(new AppError(message, 400));
      }
      next(error);
    }
  };
};
