import { PrismaClient } from "@/generated/prisma/client";

export class StatsRepository {
  constructor(private prisma: PrismaClient) { }

  async getOverviewStats() {
    const [totalUsers, activeSubscriptions, totalStorageResult, packages] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.subscription.count({ where: { isActive: true } }),
      this.prisma.file.aggregate({
        where: { isDeleted: false },
        _sum: { size: true },
      }),
      this.prisma.package.findMany({
        include: {
          _count: {
            select: { subscriptions: true },
          },
        },
        orderBy: {
          subscriptions: {
            _count: 'desc',
          },
        },
        take: 5,
      }),
    ]);

    const popularPackages = packages.map(pkg => ({
      id: pkg.id,
      name: pkg.name,
      price: pkg.price,
      subscriberCount: pkg._count.subscriptions,
    }));

    return {
      totalUsers,
      activeSubscriptions,
      totalStorage: totalStorageResult._sum.size || BigInt(0),
      popularPackages,
    };
  }

  async getRevenueStats(from?: Date, to?: Date) {
    const where: any = {
      isActive: true,
    };

    if (from) {
      where.startDate = { gte: from };
    }
    if (to) {
      where.startDate = { lte: to };
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where,
      include: {
        package: true,
      },
    });

    const revenue = subscriptions.map(sub => ({
      date: sub.startDate,
      amount: sub.package.price,
      packageName: sub.package.name,
    }));

    const breakdown = subscriptions.reduce((acc: any, sub) => {
      const packageName = sub.package.name;
      if (!acc[packageName]) {
        acc[packageName] = { count: 0, revenue: 0 };
      }
      acc[packageName].count += 1;
      acc[packageName].revenue += sub.package.price;
      return acc;
    }, {});

    return { revenue, breakdown };
  }

  async getUsageStats() {
    const [topUsers, storageTrend] = await Promise.all([
      this.prisma.user.findMany({
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          files: {
            where: { isDeleted: false },
            select: { size: true },
          },
        },
      }),
      this.prisma.file.groupBy({
        by: ['createdAt'],
        where: { isDeleted: false },
        _sum: { size: true },
        _count: true,
        orderBy: { createdAt: 'desc' },
        take: 30,
      }),
    ]);

    const topUsersWithStorage = topUsers
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        totalStorage: user.files.reduce((sum, file) => sum + Number(file.size), 0),
      }))
      .sort((a, b) => b.totalStorage - a.totalStorage)
      .slice(0, 10);

    return {
      topUsers: topUsersWithStorage,
      storageTrend: storageTrend.map(item => ({
        date: item.createdAt,
        size: item._sum.size || BigInt(0),
        fileCount: item._count,
      })),
    };
  }
}
