import { User, PrismaClient } from "@/generated/prisma/client";

export class UserRepository {
  constructor(private prisma: PrismaClient) { }

  async getAllUsers(page: number, limit: number, search?: string) {
    const skip = (page - 1) * limit;
    
    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { name: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          isEmailVerified: true,
          isSuspended: true,
          suspensionReason: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async getUserById(id: string) {
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
        createdAt: true,
        updatedAt: true,
        subscription: {
          include: {
            package: true,
          },
        },
      },
    });
  }

  async updateUserRole(id: string, isAdmin: boolean): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: { isAdmin },
    });
  }

  async suspendUser(id: string, reason: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        isSuspended: true,
        suspensionReason: reason,
      },
    });
  }

  async activateUser(id: string): Promise<User> {
    return await this.prisma.user.update({
      where: { id },
      data: {
        isSuspended: false,
        suspensionReason: null,
      },
    });
  }

  async getUserUsageStats(userId: string) {
    const [fileCount, folderCount, totalSize] = await Promise.all([
      this.prisma.file.count({
        where: { userId, isDeleted: false },
      }),
      this.prisma.folder.count({
        where: { userId, isDeleted: false },
      }),
      this.prisma.file.aggregate({
        where: { userId, isDeleted: false },
        _sum: { size: true },
      }),
    ]);

    return {
      fileCount,
      folderCount,
      totalSize: totalSize._sum.size || BigInt(0),
    };
  }
}
