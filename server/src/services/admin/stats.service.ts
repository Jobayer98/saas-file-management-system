import { StatsRepository } from '../../repositories/admin/stats.repository';

export class StatsService {
  constructor(private statsRepository: StatsRepository) { }

  async getOverviewStats() {
    const stats = await this.statsRepository.getOverviewStats();
    
    return {
      totalUsers: stats.totalUsers,
      activeSubscriptions: stats.activeSubscriptions,
      totalStorage: stats.totalStorage.toString(),
      popularPackages: stats.popularPackages.map((pkg: any) => ({
        ...pkg,
        price: pkg.price,
      })),
    };
  }

  async getRevenueStats(from?: Date, to?: Date) {
    const { revenue, breakdown } = await this.statsRepository.getRevenueStats(from, to);
    
    return {
      revenue,
      breakdown: Object.entries(breakdown).map(([packageName, data]: [string, any]) => ({
        packageName,
        subscriptionCount: data.count,
        revenue: data.revenue,
      })),
    };
  }

  async getUsageStats() {
    const stats = await this.statsRepository.getUsageStats();
    
    return {
      topUsers: stats.topUsers,
      storageTrend: stats.storageTrend.map((item: any) => ({
        date: item.date,
        size: item.size.toString(),
        fileCount: item.fileCount,
      })),
    };
  }
}
