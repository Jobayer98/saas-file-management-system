"use client";

import { useState, useEffect } from "react";
import { adminService } from "@/lib/api/services/admin.service";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  UsersIcon,
  ActivityIcon,
  HardDriveIcon,
  FileIcon,
  FolderIcon,
  DollarSignIcon,
  TrendingUpIcon,
  RefreshCwIcon,
  PackageIcon,
} from "lucide-react";

export default function AdminStatisticsPage() {
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [usageStats, setUsageStats] = useState<any>(null);

  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const [overview, revenue, usage] = await Promise.all([
        adminService.getOverviewStats(),
        adminService.getRevenueStats(),
        adminService.getUsageStats(),
      ]);
      setOverviewStats(overview);
      setRevenueStats(revenue);
      setUsageStats(usage);
    } catch (error: any) {
      toast.error("Failed to load statistics");
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistics & Analytics</h1>
          <p className="text-muted-foreground">
            View system statistics and analytics
          </p>
        </div>
        <Button
          onClick={loadStatistics}
          variant="outline"
          size="sm"
          disabled={loading}
        >
          <RefreshCwIcon
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats?.totalUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {overviewStats?.activeUsers || 0} active users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <ActivityIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats?.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-muted-foreground">Paying subscribers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatBytes(Number(overviewStats?.totalStorage) || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatBytes(usageStats?.averageStoragePerUser || 0)}/user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats?.totalFiles?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {overviewStats?.totalFolders?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-muted-foreground">Across all users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Storage Growth
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {usageStats?.storageGrowthRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">Growth rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Statistics</CardTitle>
          <CardDescription>
            Total revenue and breakdown by package
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSignIcon className="h-5 w-5 text-green-600" />
                <span className="font-medium">Total Revenue</span>
              </div>
              <span className="text-2xl font-bold">
                {formatCurrency(
                  revenueStats?.breakdown.reduce(
                    (acc: number, item: any) => acc + item.revenue,
                    0,
                  ) || 0,
                )}
              </span>
            </div>

            {revenueStats?.breakdown && revenueStats.breakdown.length > 0 ? (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Revenue by Package</h4>
                {revenueStats.breakdown.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.packageName}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.subscriptionCount} subscriptions
                      </p>
                    </div>
                    <span className="font-bold">
                      {formatCurrency(item.revenue)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No revenue data available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Popular Packages */}
      <Card>
        <CardHeader>
          <CardTitle>Popular Packages</CardTitle>
          <CardDescription>Most subscribed packages</CardDescription>
        </CardHeader>
        <CardContent>
          {overviewStats?.popularPackages &&
          overviewStats.popularPackages.length > 0 ? (
            <div className="space-y-2">
              {overviewStats.popularPackages.map((pkg: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <PackageIcon className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{pkg.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{pkg.subscriberCount}</p>
                    <p className="text-xs text-muted-foreground">subscribers</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No package data available
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Users by Storage */}
      <Card>
        <CardHeader>
          <CardTitle>Top Users by Storage</CardTitle>
          <CardDescription>Users with highest storage usage</CardDescription>
        </CardHeader>
        <CardContent>
          {usageStats?.topUsers && usageStats.topUsers.length > 0 ? (
            <div className="space-y-2">
              {usageStats.topUsers.map((user: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.totalFiles} files, {user.totalFolders} folders
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatBytes(Number(user.totalStorage))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      storage used
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No user data available
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
