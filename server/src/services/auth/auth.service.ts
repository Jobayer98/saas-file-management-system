import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/email";
import { AppError } from "@/middlewares/error/error.middleware";
import { AuthRepository } from "@/repositories/auth/auth.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "@/utils/helpers/jwt.helper";
import { hashPassword, generateRandomToken, comparePassword } from "@/utils/helpers/password.helper";
import { RegisterInput, LoginInput, ForgotPasswordInput, ResetPasswordInput } from "@/validators/auth/auth.validator";


export class AuthService {
  constructor(private authRepository: AuthRepository,) { }

  async register(data: RegisterInput) {
    const existingUser = await this.authRepository.findUserByEmail(data.email);
    
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }

    const hashedPassword = await hashPassword(data.password);
    const emailVerifyToken = generateRandomToken();

    const user = await this.authRepository.createUserWithFreeSubscription({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      emailVerifyToken,
    });

    // Send verification email
    await sendVerificationEmail(user.email, emailVerifyToken);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  async login(data: LoginInput) {
    const user = await this.authRepository.findUserByEmail(data.email);
    
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (user.isSuspended) {
      throw new AppError('Account is suspended', 403);
    }

    const isPasswordValid = await comparePassword(data.password, user.password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401);
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Store refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await this.authRepository.createRefreshToken(user.id, refreshToken, expiresAt);

    return {
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }

  async logout(refreshToken: string) {
    try {
      await this.authRepository.deleteRefreshToken(refreshToken);
      return { message: 'Logged out successfully' };
    } catch (error) {
      throw new AppError('Invalid refresh token', 400);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.authRepository.verifyEmail(token);
    
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }

    return { message: 'Email verified successfully' };
  }

  async forgotPassword(data: ForgotPasswordInput) {
    const user = await this.authRepository.findUserByEmail(data.email);
    
    if (!user) {
      // Don't reveal if email exists
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateRandomToken();
    const expiry = new Date();
    expiry.setHours(expiry.getHours() + 1);

    await this.authRepository.setPasswordResetToken(data.email, resetToken, expiry);

    await sendPasswordResetEmail(user.email, resetToken);

    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(data: ResetPasswordInput) {
    const hashedPassword = await hashPassword(data.newPassword);
    const user = await this.authRepository.resetPassword(data.token, hashedPassword);
    
    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Delete all refresh tokens for security
    await this.authRepository.deleteUserRefreshTokens(user.id);

    return { message: 'Password reset successfully' };
  }

  async refreshAccessToken(refreshToken: string) {
    const storedToken = await this.authRepository.findRefreshToken(refreshToken);
    
    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const accessToken = generateAccessToken(decoded);

    return { token: accessToken };
  }

  async getMe(userId: string) {
    const user = await this.authRepository.findUserById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return { user };
  }
}
