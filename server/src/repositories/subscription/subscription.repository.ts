import type { Subscription, PrismaClient } from '@/generated/prisma/client';

export class SubscriptionRepository {
  constructor(private prisma: PrismaClient) { }

  async getActivePackages() {
    return await this.prisma.package.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  async getCurrentSubscription(userId: string) {
    return await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        package: true,
      },
    });
  }

  async createSubscription(userId: string, packageId: number): Promise<Subscription> {
    return await this.prisma.subscription.create({
      data: {
        userId,
        packageId,
        isActive: true,
      },
    });
  }

  async updateSubscription(userId: string, packageId: number): Promise<Subscription> {
    return await this.prisma.subscription.update({
      where: { userId },
      data: {
        packageId,
        startDate: new Date(),
        endDate: null,
      },
    });
  }

  async cancelSubscription(userId: string): Promise<Subscription> {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30); // Grace period of 30 days

    return await this.prisma.subscription.update({
      where: { userId },
      data: {
        isActive: false,
        endDate,
      },
    });
  }

  async renewSubscription(userId: string): Promise<Subscription> {
    return await this.prisma.subscription.update({
      where: { userId },
      data: {
        isActive: true,
        startDate: new Date(),
        endDate: null,
      },
    });
  }

  async getSubscriptionHistory(userId: string, _page: number, _limit: number) {
    // For now, we'll return the current subscription as history
    // In a real app, you'd have a separate SubscriptionHistory table
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
      include: {
        package: true,
      },
    });

    if (!subscription) {
      return { history: [], total: 0 };
    }

    return {
      history: [subscription],
      total: 1,
    };
  }

  async getUserUsageStats(userId: string) {
    const [fileCount, folderCount, totalSizeResult] = await Promise.all([
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
      totalSize: totalSizeResult._sum.size || BigInt(0),
    };
  }

  async getPackageById(packageId: number) {
    return await this.prisma.package.findUnique({
      where: { id: packageId },
    });
  }
}
