'use client';

import { useState, useEffect } from 'react';
import { adminService, AdminOverviewStats } from '@/lib/api/services/admin.service';

interface AdminDashboardStats extends AdminOverviewStats {
  loading: boolean;
  error: string | null;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalStorage: '0',
    popularPackages: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true, error: null }));
      
      const overviewStats = await adminService.getOverviewStats();
      
      setStats({
        ...overviewStats,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Admin stats error:', error);
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to load admin statistics',
      }));
    }
  };

  const refresh = () => {
    loadStats();
  };

  const formatStorage = (storage: string) => {
    // If storage is already formatted (like "1.5 GB"), return as is
    if (isNaN(Number(storage))) {
      return storage;
    }
    
    // If storage is a number (bytes), format it
    const bytes = Number(storage);
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMostPopularPackage = () => {
    if (stats.popularPackages.length === 0) return null;
    
    return stats.popularPackages.reduce((prev, current) => 
      current.subscriberCount > prev.subscriberCount ? current : prev
    );
  };

  const getTotalRevenue = () => {
    return stats.popularPackages.reduce((total, pkg) => 
      total + (pkg.price * pkg.subscriberCount), 0
    );
  };

  return {
    ...stats,
    refresh,
    formatStorage,
    getMostPopularPackage,
    getTotalRevenue,
  };
}