"use client";

import { useAuth } from "@/lib/auth/context";
import { useAdminStats } from "@/hooks/use-admin-stats";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  UsersIcon,
  PackageIcon,
  BarChart3Icon,
  SettingsIcon,
  RefreshCwIcon,
  DollarSignIcon,
  HardDriveIcon,
  TrendingUpIcon,
  CrownIcon,
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const {
    totalUsers,
    activeSubscriptions,
    totalStorage,
    popularPackages,
    loading,
    error,
    refresh,
    formatStorage,
    getMostPopularPackage,
    getTotalRevenue,
  } = useAdminStats();

  const mostPopularPackage = getMostPopularPackage();
  const totalRevenue = getTotalRevenue();

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your system from here.
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Failed to load admin data: {error}
              <Button
                variant="link"
                className="p-0 ml-2 text-red-600"
                onClick={refresh}
              >
                <RefreshCwIcon className="h-4 w-4 mr-1" />
                Retry
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name}! Manage your system from here.
          </p>
        </div>
        <Button
          onClick={refresh}
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalUsers === 0 ? "No users registered" : "Registered users"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : activeSubscriptions.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeSubscriptions === 0
                ? "No active subscriptions"
                : "Paying customers"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : formatStorage(totalStorage.toString())}
            </div>
            <p className="text-xs text-muted-foreground">
              Used across all users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `$${totalRevenue.toFixed(2)}`}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0
                ? "From active subscriptions"
                : "No revenue yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/admin/users">
                <UsersIcon className="h-4 w-4 mr-2" />
                Manage Users ({totalUsers})
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/packages">
                <PackageIcon className="h-4 w-4 mr-2" />
                Manage Packages ({popularPackages.length})
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/admin/statistics">
                <BarChart3Icon className="h-4 w-4 mr-2" />
                View Statistics
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Package Overview</CardTitle>
            <CardDescription>Subscription package statistics</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 animate-pulse"
                  >
                    <div className="h-4 w-4 bg-muted rounded" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : popularPackages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No packages available
              </p>
            ) : (
              <div className="space-y-3">
                {popularPackages.slice(0, 4).map((pkg) => (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <PackageIcon className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium flex items-center">
                          {pkg.name}
                          {mostPopularPackage?.id === pkg.id &&
                            pkg.subscriberCount > 0 && (
                              <CrownIcon className="h-3 w-3 ml-1 text-yellow-500" />
                            )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ${pkg.price}/month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          pkg.subscriberCount > 0 ? "default" : "secondary"
                        }
                      >
                        {pkg.subscriberCount} users
                      </Badge>
                    </div>
                  </div>
                ))}

                {mostPopularPackage && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">
                      Most Popular
                    </p>
                    <p className="text-sm font-medium">
                      {mostPopularPackage.name} -{" "}
                      {mostPopularPackage.subscriberCount} subscribers
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Health Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current system health and performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">API Status</span>
                <Badge variant="default" className="bg-green-500">
                  Online
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database</span>
                <Badge variant="default" className="bg-green-500">
                  Connected
                </Badge>
              </div>
              <Progress value={100} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Storage</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <Progress value={15} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {formatStorage(totalStorage.toString())} used
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
