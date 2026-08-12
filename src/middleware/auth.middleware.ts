import { Request, Response, NextFunction } from 'express';
import { AppError } from './error.middleware';
import { verifyAccessToken } from '../utils/token.util';
import { prisma } from '../config/database';

export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;

    // Access tokens are only accepted from the Authorization header. Accepting
    // them from a cookie would make every state-changing route CSRF-able.
    if (req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw new AppError('You are not logged in. Please log in to get access.', 401);
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId || decoded.sub },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      },
    });

    if (!currentUser) {
      throw new AppError('The user belonging to this token does no longer exist.', 401);
    }

    if (!currentUser.isActive) {
      throw new AppError('Your account has been deactivated. Please contact administrator.', 403);
    }

    // Grant access to protected route
    req.user = {
      userId: currentUser.id,
      sub: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
    };
    next();
  } catch (error) {
    next(error);
  }
};
