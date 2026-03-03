import { DashboardRepository } from '@/repositories/dashboard/dashboard.repository';

export class DashboardService {
  constructor(private dashboardRepository: DashboardRepository) {}

  async getDashboardStats(userId: string) {
    const [
      totalFiles,
      totalFolders,
      storageUsed,
      subscription,
      recentFiles
    ] = await Promise.all([
      this.dashboardRepository.getTotalFiles(userId),
      this.dashboardRepository.getTotalFolders(userId),
      this.dashboardRepository.getStorageUsed(userId),
      this.dashboardRepository.getUserSubscription(userId),
      this.dashboardRepository.getRecentFiles(userId, 5)
    ]);

    return {
      totalFiles,
      totalFolders,
      storageUsed,
      subscriptionType: subscription?.package?.name || 'Free',
      recentFiles
    };
  }
}