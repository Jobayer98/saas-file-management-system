import { AuthService } from '../../src/services/auth/auth.service';
import { AuthRepository } from '../../src/repositories/auth/auth.repository';
import { AppError } from '../../src/middlewares/error/error.middleware';
import * as emailLib from '../../src/lib/email';
import * as jwtHelper from '../../src/utils/helpers/jwt.helper';
import * as passwordHelper from '../../src/utils/helpers/password.helper';

// Mock dependencies
jest.mock('../../src/repositories/auth/auth.repository');
jest.mock('../../src/lib/email');
jest.mock('../../src/utils/helpers/jwt.helper');
jest.mock('../../src/utils/helpers/password.helper');

describe('AuthService', () => {
  let authService: AuthService;
  let mockAuthRepository: jest.Mocked<AuthRepository>;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Create mock repository with all required methods
    mockAuthRepository = {
      findUserByEmail: jest.fn(),
      findUserById: jest.fn(),
      createUserWithFreeSubscription: jest.fn(),
      verifyEmail: jest.fn(),
      setPasswordResetToken: jest.fn(),
      resetPassword: jest.fn(),
      createRefreshToken: jest.fn(),
      findRefreshToken: jest.fn(),
      deleteRefreshToken: jest.fn(),
      deleteUserRefreshTokens: jest.fn(),
    } as any;
    
    // Initialize service with mocked repository
    authService = new AuthService(mockAuthRepository);
  });

  describe('register', () => {
    const registerInput = {
      email: 'test@example.com',
      password: 'Password123!',
      name: 'Test User',
    };

    it('should successfully register a new user', async () => {
      // Arrange
      const hashedPassword = 'hashed_password';
      const emailVerifyToken = 'verify_token_123';
      const mockUser = {
        id: 'user_123',
        email: registerInput.email,
        name: registerInput.name,
        password: hashedPassword,
        emailVerifyToken,
        isEmailVerified: false,
        isAdmin: false,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepository.findUserByEmail.mockResolvedValue(null);
      mockAuthRepository.createUserWithFreeSubscription.mockResolvedValue(mockUser);
      (passwordHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      (passwordHelper.generateRandomToken as jest.Mock).mockReturnValue(emailVerifyToken);
      (emailLib.sendVerificationEmail as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await authService.register(registerInput);

      // Assert
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(registerInput.email);
      expect(passwordHelper.hashPassword).toHaveBeenCalledWith(registerInput.password);
      expect(passwordHelper.generateRandomToken).toHaveBeenCalled();
      expect(mockAuthRepository.createUserWithFreeSubscription).toHaveBeenCalledWith({
        email: registerInput.email,
        password: hashedPassword,
        name: registerInput.name,
        emailVerifyToken,
      });
      expect(emailLib.sendVerificationEmail).toHaveBeenCalledWith(mockUser.email, emailVerifyToken);
      expect(result).toEqual({
        message: 'Registration successful. Please check your email to verify your account.',
        userId: mockUser.id,
      });
    });

    it('should throw error if email already exists', async () => {
      // Arrange
      const existingUser = {
        id: 'existing_user',
        email: registerInput.email,
        name: 'Existing User',
        password: 'hashed',
        emailVerifyToken: null,
        isEmailVerified: true,
        isAdmin: false,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthRepository.findUserByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(authService.register(registerInput)).rejects.toThrow(
        new AppError('Email already registered', 400)
      );
      expect(mockAuthRepository.createUserWithFreeSubscription).not.toHaveBeenCalled();
      expect(emailLib.sendVerificationEmail).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    const loginInput = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    const mockUser = {
      id: 'user_123',
      email: loginInput.email,
      name: 'Test User',
      password: 'hashed_password',
      emailVerifyToken: null,
      isEmailVerified: true,
      isAdmin: false,
      isSuspended: false,
      suspensionReason: null,
      resetPasswordToken: null,
      resetPasswordExpiry: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should successfully login with valid credentials', async () => {
      // Arrange
      const accessToken = 'access_token_123';
      const refreshToken = 'refresh_token_123';

      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (passwordHelper.comparePassword as jest.Mock).mockResolvedValue(true);
      (jwtHelper.generateAccessToken as jest.Mock).mockReturnValue(accessToken);
      (jwtHelper.generateRefreshToken as jest.Mock).mockReturnValue(refreshToken);
      mockAuthRepository.createRefreshToken.mockResolvedValue({
        id: 'token_id',
        userId: mockUser.id,
        token: refreshToken,
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      // Act
      const result = await authService.login(loginInput);

      // Assert
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(loginInput.email);
      expect(passwordHelper.comparePassword).toHaveBeenCalledWith(loginInput.password, mockUser.password);
      expect(jwtHelper.generateAccessToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin,
      });
      expect(jwtHelper.generateRefreshToken).toHaveBeenCalledWith({
        id: mockUser.id,
        email: mockUser.email,
        isAdmin: mockUser.isAdmin,
      });
      expect(mockAuthRepository.createRefreshToken).toHaveBeenCalled();
      expect(result).toEqual({
        token: accessToken,
        refreshToken,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
          isAdmin: mockUser.isAdmin,
          isEmailVerified: mockUser.isEmailVerified,
        },
      });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
      expect(passwordHelper.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error if account is suspended', async () => {
      // Arrange
      const suspendedUser = { ...mockUser, isSuspended: true };
      mockAuthRepository.findUserByEmail.mockResolvedValue(suspendedUser);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(
        new AppError('Account is suspended', 403)
      );
      expect(passwordHelper.comparePassword).not.toHaveBeenCalled();
    });

    it('should throw error if password is invalid', async () => {
      // Arrange
      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (passwordHelper.comparePassword as jest.Mock).mockResolvedValue(false);

      // Act & Assert
      await expect(authService.login(loginInput)).rejects.toThrow(
        new AppError('Invalid credentials', 401)
      );
      expect(jwtHelper.generateAccessToken).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should successfully logout with valid refresh token', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      mockAuthRepository.deleteRefreshToken.mockResolvedValue(undefined);

      // Act
      const result = await authService.logout(refreshToken);

      // Assert
      expect(mockAuthRepository.deleteRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(result).toEqual({ message: 'Logged out successfully' });
    });

    it('should throw error if refresh token is invalid', async () => {
      // Arrange
      const refreshToken = 'invalid_refresh_token';
      mockAuthRepository.deleteRefreshToken.mockRejectedValue(new Error('Token not found'));

      // Act & Assert
      await expect(authService.logout(refreshToken)).rejects.toThrow(
        new AppError('Invalid refresh token', 400)
      );
    });
  });

  describe('verifyEmail', () => {
    it('should successfully verify email with valid token', async () => {
      // Arrange
      const token = 'valid_verify_token';
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed_password',
        emailVerifyToken: null,
        isEmailVerified: true,
        isAdmin: false,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockAuthRepository.verifyEmail.mockResolvedValue(mockUser);

      // Act
      const result = await authService.verifyEmail(token);

      // Assert
      expect(mockAuthRepository.verifyEmail).toHaveBeenCalledWith(token);
      expect(result).toEqual({ message: 'Email verified successfully' });
    });

    it('should throw error if token is invalid', async () => {
      // Arrange
      const token = 'invalid_token';
      mockAuthRepository.verifyEmail.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.verifyEmail(token)).rejects.toThrow(
        new AppError('Invalid or expired verification token', 400)
      );
    });
  });

  describe('forgotPassword', () => {
    const forgotPasswordInput = {
      email: 'test@example.com',
    };

    it('should send reset email for existing user', async () => {
      // Arrange
      const mockUser = {
        id: 'user_123',
        email: forgotPasswordInput.email,
        name: 'Test User',
        password: 'hashed_password',
        emailVerifyToken: null,
        isEmailVerified: true,
        isAdmin: false,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: 'reset_token_123',
        resetPasswordExpiry: new Date(Date.now() + 3600000),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const resetToken = 'reset_token_123';

      mockAuthRepository.findUserByEmail.mockResolvedValue(mockUser);
      (passwordHelper.generateRandomToken as jest.Mock).mockReturnValue(resetToken);
      mockAuthRepository.setPasswordResetToken.mockResolvedValue(mockUser);
      (emailLib.sendPasswordResetEmail as jest.Mock).mockResolvedValue(undefined);

      // Act
      const result = await authService.forgotPassword(forgotPasswordInput);

      // Assert
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(forgotPasswordInput.email);
      expect(passwordHelper.generateRandomToken).toHaveBeenCalled();
      expect(mockAuthRepository.setPasswordResetToken).toHaveBeenCalled();
      expect(emailLib.sendPasswordResetEmail).toHaveBeenCalledWith(mockUser.email, resetToken);
      expect(result).toEqual({ message: 'If the email exists, a reset link has been sent' });
    });

    it('should return generic message for non-existing user', async () => {
      // Arrange
      mockAuthRepository.findUserByEmail.mockResolvedValue(null);

      // Act
      const result = await authService.forgotPassword(forgotPasswordInput);

      // Assert
      expect(mockAuthRepository.findUserByEmail).toHaveBeenCalledWith(forgotPasswordInput.email);
      expect(mockAuthRepository.setPasswordResetToken).not.toHaveBeenCalled();
      expect(emailLib.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'If the email exists, a reset link has been sent' });
    });
  });

  describe('resetPassword', () => {
    const resetPasswordInput = {
      token: 'valid_reset_token',
      newPassword: 'NewPassword123!',
    };

    it('should successfully reset password with valid token', async () => {
      // Arrange
      const hashedPassword = 'new_hashed_password';
      const mockUser = {
        id: 'user_123',
        email: 'test@example.com',
      };

      (passwordHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockAuthRepository.resetPassword.mockResolvedValue(mockUser as any);
      mockAuthRepository.deleteUserRefreshTokens.mockResolvedValue(undefined);

      // Act
      const result = await authService.resetPassword(resetPasswordInput);

      // Assert
      expect(passwordHelper.hashPassword).toHaveBeenCalledWith(resetPasswordInput.newPassword);
      expect(mockAuthRepository.resetPassword).toHaveBeenCalledWith(resetPasswordInput.token, hashedPassword);
      expect(mockAuthRepository.deleteUserRefreshTokens).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ message: 'Password reset successfully' });
    });

    it('should throw error if token is invalid', async () => {
      // Arrange
      const hashedPassword = 'new_hashed_password';
      (passwordHelper.hashPassword as jest.Mock).mockResolvedValue(hashedPassword);
      mockAuthRepository.resetPassword.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.resetPassword(resetPasswordInput)).rejects.toThrow(
        new AppError('Invalid or expired reset token', 400)
      );
      expect(mockAuthRepository.deleteUserRefreshTokens).not.toHaveBeenCalled();
    });
  });

  describe('refreshAccessToken', () => {
    it('should successfully refresh access token', async () => {
      // Arrange
      const refreshToken = 'valid_refresh_token';
      const newAccessToken = 'new_access_token';
      const storedToken = {
        id: 'token_id',
        userId: 'user_123',
        token: refreshToken,
        expiresAt: new Date(Date.now() + 86400000), // 1 day from now
        createdAt: new Date(),
      };
      const decodedToken = {
        id: 'user_123',
        email: 'test@example.com',
        isAdmin: false,
      };

      mockAuthRepository.findRefreshToken.mockResolvedValue(storedToken);
      (jwtHelper.verifyRefreshToken as jest.Mock).mockReturnValue(decodedToken);
      (jwtHelper.generateAccessToken as jest.Mock).mockReturnValue(newAccessToken);

      // Act
      const result = await authService.refreshAccessToken(refreshToken);

      // Assert
      expect(mockAuthRepository.findRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(jwtHelper.verifyRefreshToken).toHaveBeenCalledWith(refreshToken);
      expect(jwtHelper.generateAccessToken).toHaveBeenCalledWith(decodedToken);
      expect(result).toEqual({ token: newAccessToken });
    });

    it('should throw error if refresh token not found', async () => {
      // Arrange
      const refreshToken = 'invalid_refresh_token';
      mockAuthRepository.findRefreshToken.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        new AppError('Invalid or expired refresh token', 401)
      );
      expect(jwtHelper.verifyRefreshToken).not.toHaveBeenCalled();
    });

    it('should throw error if refresh token is expired', async () => {
      // Arrange
      const refreshToken = 'expired_refresh_token';
      const expiredToken = {
        id: 'token_id',
        userId: 'user_123',
        token: refreshToken,
        expiresAt: new Date(Date.now() - 86400000), // 1 day ago
        createdAt: new Date(),
      };

      mockAuthRepository.findRefreshToken.mockResolvedValue(expiredToken);

      // Act & Assert
      await expect(authService.refreshAccessToken(refreshToken)).rejects.toThrow(
        new AppError('Invalid or expired refresh token', 401)
      );
      expect(jwtHelper.verifyRefreshToken).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('should successfully get user details', async () => {
      // Arrange
      const userId = 'user_123';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        name: 'Test User',
        isEmailVerified: true,
        isAdmin: false,
      };

      mockAuthRepository.findUserById.mockResolvedValue(mockUser as any);

      // Act
      const result = await authService.getMe(userId);

      // Assert
      expect(mockAuthRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual({ user: mockUser });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      const userId = 'non_existent_user';
      mockAuthRepository.findUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(authService.getMe(userId)).rejects.toThrow(
        new AppError('User not found', 404)
      );
    });
  });
});
