import { JwtPayload } from './auth.types';

// ─── Extend Express Request globally ───────────────────────────────────────────
declare global {
  namespace Express {
    interface Request {
      /**
       * Populated by auth middleware after JWT verification.
       * Contains the decoded JWT payload (userId, email, role).
       */
      user?: JwtPayload;
    }
  }
}

export {};
