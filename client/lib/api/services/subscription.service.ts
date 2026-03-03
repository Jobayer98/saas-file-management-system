import { apiClient } from '../client';
import type { Package, Subscription, UsageStats } from '@/types';

export const subscriptionService = {
  async getActivePackages(): Promise<Package[]> {
    const response = await apiClient.get('/subscriptions/packages');
    return response.data.data;
  },

  async getCurrentSubscription(): Promise<{ subscription: Subscription; package: Package; usage: UsageStats }> {
    const response = await apiClient.get('/subscriptions/current');
    return response.data.data;
  },

  async selectPackage(packageId: number): Promise<Subscription> {
    const response = await apiClient.post('/subscriptions/select', { packageId });
    return response.data.data;
  },

  async changePackage(newPackageId: number): Promise<Subscription> {
    const response = await apiClient.put('/subscriptions/change', { newPackageId });
    return response.data.data;
  },

  async getUsage(): Promise<UsageStats> {
    const response = await apiClient.get('/subscriptions/usage');
    return response.data.data;
  },

  async getLimits(): Promise<{ current: any; allowed: any; remaining: any }> {
    const response = await apiClient.get('/subscriptions/limits');
    return response.data.data;
  },

  async cancelSubscription(): Promise<{ endDate: string }> {
    const response = await apiClient.post('/subscriptions/cancel');
    return response.data.data;
  },

  async renewSubscription(): Promise<Subscription> {
    const response = await apiClient.post('/subscriptions/renew');
    return response.data.data;
  },
};
