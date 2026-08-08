import { protect } from '../middleware/auth.middleware';
import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema, refreshTokenSchema } from '../validation/auth.schema';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

const router = Router();

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX, // limit each IP to N requests per windowMs
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again after 15 minutes',
  },
});

router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', validate(refreshTokenSchema), authController.refresh);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

export default router;
