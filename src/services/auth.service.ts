import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { comparePassword, hashPassword } from '../utils/password.util';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/token.util';
import { TokenPair } from '../types/auth.types';

export class AuthService {
  /**
   * Authenticate a user by email and password
   */
  public async login(email: string, password: string): Promise<{ user: any; tokens: TokenPair }> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { facultyProfile: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('Invalid email or password', 401);
    }

    const isPasswordCorrect = await comparePassword(password, user.password);
    if (!isPasswordCorrect) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const payload = { userId: user.id, role: user.role };
    const tokens = {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload),
    };

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, tokens };
  }

  /**
   * Refresh the access token using a valid refresh token
   */
  public async refreshToken(token: string): Promise<TokenPair> {
    const decoded = verifyRefreshToken(token);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      throw new AppError('User no longer exists or is deactivated', 401);
    }

    const payload = { userId: user.id, role: user.role };
    return {
      accessToken: generateAccessToken(payload),
      refreshToken: generateRefreshToken(payload), // Rotate refresh token
    };
  }

  /**
   * Get current user profile
   */
  public async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { facultyProfile: true },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

export const authService = new AuthService();
