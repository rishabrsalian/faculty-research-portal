import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { Role } from '@prisma/client';

/**
 * Restricts access to specified roles.
 * Must be used AFTER the `protect` middleware.
 */
export const restrictTo = (...roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
