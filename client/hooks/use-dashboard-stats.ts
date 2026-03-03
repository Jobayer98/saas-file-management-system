'use client';

import { useState, useEffect } from 'react';
import { dashboardService } from '@/lib/api/services';

interface DashboardStats {
  totalFiles: number;
  totalFolders: number;
  storageUsed: string;
  subscriptionType: string;
  recentFiles: any[];
  loading: boolean;
  error: string | null;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalFiles: 0,
    totalFolders: 0,
    storageUsed: '0 B',
    subscriptionType: 'Free',
    recentFiles: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));

      const data = await dashboardService.getDashboardStats();

      setStats({
        totalFiles: data.totalFiles,
        totalFolders: data.totalFolders,
        storageUsed: data.storageUsed,
        subscriptionType: data.subscriptionType,
        recentFiles: data.recentFiles,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Dashboard stats error:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load dashboard stats',
      }));
    }
  };

  const refresh = () => {
    loadStats();
  };

  return { ...stats, refresh };
}