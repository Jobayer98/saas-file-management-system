import { User, RefreshToken } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';

export class AuthRepository {
  async createUser(data: {
    email: string;
    password: string;
    name: string;
    emailVerifyToken: string;
  }): Promise<User> {
    return await prisma.user.create({
      data,
    });
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isEmailVerified: true,
        isSuspended: true,
        suspensionReason: true,
        emailVerifyToken: true,
        resetPasswordToken: true,
        resetPasswordExpiry: true,
        createdAt: true,
        updatedAt: true,
        password: false,
      },
    }) as any;
  }

  async verifyEmail(token: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) return null;

    return await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });
  }

  async setPasswordResetToken(email: string, token: string, expiry: Date): Promise<User> {
    return await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpiry: expiry,
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) return null;

    return await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return await prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}

export default new AuthRepository();
