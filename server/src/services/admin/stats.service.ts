import statsRepository from '../../repositories/admin/stats.repository';

export class StatsService {
  async getOverviewStats() {
    const stats = await statsRepository.getOverviewStats();
    
    return {
      totalUsers: stats.totalUsers,
      activeSubscriptions: stats.activeSubscriptions,
      totalStorage: stats.totalStorage.toString(),
      popularPackages: stats.popularPackages,
    };
  }

  async getRevenueStats(from?: string, to?: string) {
    const fromDate = from ? new Date(from) : undefined;
    const toDate = to ? new Date(to) : undefined;

    const stats = await statsRepository.getRevenueStats(fromDate, toDate);
    
    return {
      revenue: stats.revenue,
      breakdown: stats.breakdown,
    };
  }

  async getUsageStats() {
    const stats = await statsRepository.getUsageStats();
    
    return {
      topUsers: stats.topUsers,
      storageTrend: stats.storageTrend.map(item => ({
        date: item.date,
        size: item.size.toString(),
        fileCount: item.fileCount,
      })),
    };
  }
}

export default new StatsService();
