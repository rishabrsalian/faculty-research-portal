import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './error.middleware';

/**
 * Middleware to validate incoming request data against a Zod schema.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
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
