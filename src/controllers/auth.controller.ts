import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { sendSuccess } from '../utils/response.util';
import { env } from '../config/env';

export class AuthController {
  /**
   * Login user and return tokens
   */
  public async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const { user, tokens } = await authService.login(email, password);

    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, { user, accessToken: tokens.accessToken }, "Login successful", 200);
  }

  /**
   * Refresh access token
   */
  public async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    const tokens = await authService.refreshToken(refreshToken);

    // Rotate refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    sendSuccess(res, { accessToken: tokens.accessToken }, "Token refreshed", 200);
  }

  /**
   * Logout user
   */
  public async logout(req: Request, res: Response) {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    sendSuccess(res, null, "Logout successful", 200);
  }

  /**
   * Get current user
   */
  public async getMe(req: Request, res: Response) {
    const user = await authService.getMe(req.user!.sub);
    sendSuccess(res, user, "Profile fetched successfully", 200);
  }
}

export const authController = new AuthController();
