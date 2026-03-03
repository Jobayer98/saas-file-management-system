import { apiClient } from '../client';

export interface AdminOverviewStats {
  totalUsers: number;
  activeUsers: number;
  activeSubscriptions: number;
  totalStorage: number;
  totalFiles: number;
  totalFolders: number;
  popularPackages: {
    id: string;
    name: string;
    price: number;
    subscriberCount: number;
  }[];
}

export interface AdminRevenueStats {
  totalRevenue: number;
  revenue: {
    date: string;
    amount: number;
  }[];
  breakdown: {
    packageId: string;
    packageName: string;
    revenue: number;
    subscriptionCount: number;
  }[];
}

export interface AdminUsageStats {
  topUsers: {
    userId: string;
    userName: string;
    email: string;
    storageUsed: number;
    fileCount: number;
    folderCount: number;
  }[];
  storageTrend: {
    date: string;
    totalStorage: number;
    fileCount: number;
  }[];
  averageStoragePerUser: number;
  storageGrowthRate: number;
}

export const adminService = {
  async getOverviewStats(): Promise<AdminOverviewStats> {
    const response = await apiClient.get('/admin/stats/overview');
    return response.data.data;
  },

  async getRevenueStats(from?: string, to?: string): Promise<AdminRevenueStats> {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    
    const response = await apiClient.get(`/admin/stats/revenue?${params}`);
    return response.data.data;
  },

  async getUsageStats(): Promise<AdminUsageStats> {
    const response = await apiClient.get('/admin/stats/usage');
    return response.data.data;
  },

  // User Management
  async getUsers(page = 1, limit = 20, search?: string) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (search) params.append('search', search);
    
    const response = await apiClient.get(`/admin/users?${params}`);
    return response.data.data; // Returns { users, total, page, limit, totalPages }
  },

  async getUserById(id: string) {
    const response = await apiClient.get(`/admin/users/${id}`);
    return response.data.data; // Returns { user, subscription, usage }
  },

  async updateUserRole(id: string, isAdmin: boolean) {
    const response = await apiClient.put(`/admin/users/${id}/role`, { isAdmin });
    return response.data.data;
  },

  async suspendUser(id: string, reason: string) {
    const response = await apiClient.post(`/admin/users/${id}/suspend`, { reason });
    return response.data;
  },

  async activateUser(id: string) {
    const response = await apiClient.post(`/admin/users/${id}/activate`);
    return response.data;
  },

  // Package Management
  async getPackages() {
    const response = await apiClient.get('/admin/packages');
    return response.data.data;
  },

  async getPackageById(id: number) {
    const response = await apiClient.get(`/admin/packages/${id}`);
    return response.data.data;
  },

  async createPackage(packageData: any) {
    const response = await apiClient.post('/admin/packages', packageData);
    return response.data.data;
  },

  async updatePackage(id: number, packageData: any) {
    const response = await apiClient.put(`/admin/packages/${id}`, packageData);
    return response.data.data;
  },

  async deletePackage(id: number) {
    const response = await apiClient.delete(`/admin/packages/${id}`);
    return response.data;
  },

  async togglePackage(id: number) {
    const response = await apiClient.patch(`/admin/packages/${id}/toggle`);
    return response.data.data;
  },
};