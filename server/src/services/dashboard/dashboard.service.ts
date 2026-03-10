import { DashboardRepository } from "@/repositories/dashboard/dashboard.repository";
import { CacheService } from "@/services/cache/cache.service";

export class DashboardService {
  constructor(
    private dashboardRepository: DashboardRepository,
    private cacheService: CacheService,
  ) {}

  async getDashboardStats(userId: string) {
    const cacheKey = `dashboard:stats:${userId}`;

    // Try to get from cache
    const cached = await this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const [totalFiles, totalFolders, storageUsed, subscription, recentFiles] =
      await Promise.all([
        this.dashboardRepository.getTotalFiles(userId),
        this.dashboardRepository.getTotalFolders(userId),
        this.dashboardRepository.getStorageUsed(userId),
        this.dashboardRepository.getUserSubscription(userId),
        this.dashboardRepository.getRecentFiles(userId, 5),
      ]);

    const stats = {
      totalFiles,
      totalFolders,
      storageUsed,
      subscriptionType: subscription?.package?.name || "Free",
      recentFiles,
    };

    // Cache for 5 minutes
    await this.cacheService.set(cacheKey, stats, 300);

    return stats;
  }
}
