import { apiClient } from '../client';

export interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  storageUsed: string;
  subscriptionType: string;
  recentFiles: RecentFile[];
}

export interface RecentFile {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: string;
  createdAt: string;
  updatedAt: string;
  folder?: {
    name: string;
    path: string;
  } | null;
}

class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await apiClient.get('/dashboard/stats');
    return response.data.data;
  }
}

export const dashboardService = new DashboardService();