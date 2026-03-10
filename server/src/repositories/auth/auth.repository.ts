import { User, RefreshToken, PrismaClient } from '@prisma/client';

export class AuthRepository {
  constructor(private prisma: PrismaClient) { }

  async createUser(data: {
    email: string;
    password: string;
    name: string;
    emailVerifyToken: string;
  }): Promise<User> {
    return await this.prisma.user.create({
      data,
    });
  }

  async createUserWithFreeSubscription(data: {
    email: string;
    password: string;
    name: string;
    emailVerifyToken: string;
  }): Promise<User> {
    // Find the Free package
    const freePackage = await this.prisma.package.findFirst({
      where: { name: 'free', isActive: true },
    });

    if (!freePackage) {
      throw new Error('Free package not found. Please run database seed.');
    }

    // Create user and subscription in a transaction
    return await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data,
      });

      await tx.subscription.create({
        data: {
          userId: user.id,
          packageId: freePackage.id,
          isActive: true,
        },
      });

      return user;
    });
  }


  async findUserByEmail(email: string): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<Omit<User, 'password'> | null> {
    return await this.prisma.user.findUnique({
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
    const user = await this.prisma.user.findFirst({
      where: { emailVerifyToken: token },
    });

    if (!user) return null;

    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
      },
    });
  }

  async setPasswordResetToken(email: string, token: string, expiry: Date): Promise<User> {
    return await this.prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpiry: expiry,
      },
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) return null;

    return await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
      },
    });
  }

  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return await this.prisma.refreshToken.upsert({
      where: { token },
      update: { expiresAt },
      create: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return await this.prisma.refreshToken.findUnique({
      where: { token },
    });
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }
}
