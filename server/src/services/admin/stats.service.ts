import { StatsRepository } from "../../repositories/admin/stats.repository";
import { CacheService } from "../cache/cache.service";

export class StatsService {
  constructor(
    private statsRepository: StatsRepository,
    private cacheService: CacheService
  ) {}

  async getOverviewStats() {
    const cacheKey = 'admin:stats:overview';
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const stats = await this.statsRepository.getOverviewStats();

    const result = {
      totalUsers: stats.totalUsers,
      activeSubscriptions: stats.activeSubscriptions,
      totalStorage: stats.totalStorage.toString(),
      popularPackages: stats.popularPackages.map((pkg: any) => ({
        ...pkg,
        price: pkg.price,
      })),
    };

    await this.cacheService.set(cacheKey, result, 600); // 10 minutes

    return result;
  }

  async getRevenueStats(from?: Date, to?: Date) {
    const cacheKey = `admin:stats:revenue:${from?.getTime()}-${to?.getTime()}`;
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const { revenue, breakdown } = await this.statsRepository.getRevenueStats(
      from,
      to,
    );

    const result = {
      revenue,
      breakdown: Object.entries(breakdown).map(
        ([packageName, data]: [string, any]) => ({
          packageName,
          subscriptionCount: data.count,
          revenue: data.revenue,
        }),
      ),
    };

    await this.cacheService.set(cacheKey, result, 1800); // 30 minutes

    return result;
  }

  async getUsageStats() {
    const cacheKey = 'admin:stats:usage';
    
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const stats = await this.statsRepository.getUsageStats();

    const result = {
      topUsers: stats.topUsers,
    };

    await this.cacheService.set(cacheKey, result, 600); // 10 minutes

    return result;
  }
}
