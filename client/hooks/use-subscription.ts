import { useState, useEffect } from 'react';
import { subscriptionService } from '@/lib/api/services';
import type { Package, Subscription, UsageStats } from '@/types';

interface SubscriptionData {
  subscription: Subscription;
  package: Package;
  usage: UsageStats;
}

export function useSubscription() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const subscriptionData = await subscriptionService.getCurrentSubscription();
      setData(subscriptionData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    fetchSubscription();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}