import { User } from "@/generated/prisma/client";
import prisma from "@/lib/prisma";


export class UserRepository {
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
      prisma.user.findMany({
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
      prisma.user.count({ where }),
    ]);

    return { users, total };
  }

  async getUserById(id: string) {
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
    return await prisma.user.update({
      where: { id },
      data: { isAdmin },
    });
  }

  async suspendUser(id: string, reason: string): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        isSuspended: true,
        suspensionReason: reason,
      },
    });
  }

  async activateUser(id: string): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data: {
        isSuspended: false,
        suspensionReason: null,
      },
    });
  }

  async getUserUsageStats(userId: string) {
    const [fileCount, folderCount, totalSize] = await Promise.all([
      prisma.file.count({
        where: { userId, isDeleted: false },
      }),
      prisma.folder.count({
        where: { userId, isDeleted: false },
      }),
      prisma.file.aggregate({
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

export default new UserRepository();
