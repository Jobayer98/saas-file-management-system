"use client";

import { useState, useEffect } from "react";
import { subscriptionService } from "@/lib/api/services";
import { Package, Subscription, UsageStats } from "@/types";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  CheckIcon,
  CreditCardIcon,
  TrendingUpIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  PackageIcon,
} from "lucide-react";

export default function SubscriptionPage() {
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [packages, setPackages] = useState<Package[]>([]);
  const [usage, setUsage] = useState<any>(null);
  const [showChangeDialog, setShowChangeDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subData, pkgs] = await Promise.all([
        subscriptionService.getCurrentSubscription(),
        subscriptionService.getActivePackages(),
      ]);
      setCurrentSubscription(subData);
      setUsage(subData.usage);
      setPackages(pkgs);
    } catch (error: any) {
      toast.error("Failed to load subscription data");
      console.error("Error loading subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePackage = async () => {
    if (!selectedPackage) return;

    try {
      setActionLoading(true);
      await subscriptionService.changePackage(selectedPackage.id);
      toast.success("Package changed successfully");
      setShowChangeDialog(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to change package");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You'll have a 30-day grace period.",
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await subscriptionService.cancelSubscription();
      toast.success("Subscription cancelled successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewSubscription = async () => {
    try {
      setActionLoading(true);
      await subscriptionService.renewSubscription();
      toast.success("Subscription renewed successfully");
      loadData();
    } catch (error: any) {
      toast.error(error.message || "Failed to renew subscription");
    } finally {
      setActionLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentPackage = currentSubscription?.package;
  const subscription = currentSubscription?.subscription;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription</h1>
          <p className="text-muted-foreground">
            Manage your subscription and usage
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCwIcon className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your active subscription details
              </CardDescription>
            </div>
            {subscription?.status === "cancelled" && (
              <Badge variant="destructive">Cancelled</Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-6 bg-muted rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary rounded-lg">
                <PackageIcon className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{currentPackage?.name}</h3>
                <p className="text-muted-foreground">
                  {currentPackage?.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">
                ${currentPackage?.price}
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
              {subscription?.endDate && (
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription.status === "cancelled"
                    ? `Ends on ${formatDate(subscription.endDate)}`
                    : `Renews on ${formatDate(subscription.endDate)}`}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Max Folders</p>
              <p className="text-2xl font-bold">{currentPackage?.maxFolders}</p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Nesting Level
              </p>
              <p className="text-2xl font-bold">
                {currentPackage?.maxNestingLevel}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Files Per Folder
              </p>
              <p className="text-2xl font-bold">
                {currentPackage?.filesPerFolder}
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">
                Max File Size
              </p>
              <p className="text-2xl font-bold">
                {formatBytes(Number(currentPackage?.maxFileSize))}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {subscription?.status !== "cancelled" ? (
              <>
                <Button onClick={() => setShowChangeDialog(true)}>
                  <TrendingUpIcon className="h-4 w-4 mr-2" />
                  Change Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelSubscription}
                  disabled={actionLoading}
                >
                  Cancel Subscription
                </Button>
              </>
            ) : (
              <Button
                onClick={handleRenewSubscription}
                disabled={actionLoading}
              >
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Renew Subscription
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Usage Statistics</CardTitle>
          <CardDescription>Track your storage and file usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {formatBytes(Number(usage?.totalSize || 0))} /{" "}
                {formatBytes(Number(currentPackage?.totalFileLimit))}
              </span>
            </div>
            <Progress value={usage?.percentUsed || 0} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {usage?.percentUsed?.toFixed(1)}% used
            </p>
            {usage?.percentUsed > 80 && (
              <div className="flex items-center space-x-2 mt-2 p-2 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded">
                <AlertCircleIcon className="h-4 w-4 text-yellow-600" />
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  You're running low on storage. Consider upgrading your plan.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">{usage?.fileCount || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Files</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">{usage?.folderCount || 0}</p>
              <p className="text-sm text-muted-foreground mt-1">Folders</p>
            </div>
            <div className="p-4 border rounded-lg text-center">
              <p className="text-3xl font-bold">
                {currentPackage?.maxFolders - (usage?.folderCount || 0)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Folders Remaining
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Package Dialog */}
      <Dialog open={showChangeDialog} onOpenChange={setShowChangeDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Choose a new plan that fits your needs
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {packages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? "ring-2 ring-primary"
                    : "hover:shadow-md"
                } ${currentPackage?.id === pkg.id ? "opacity-50" : ""}`}
                onClick={() =>
                  currentPackage?.id !== pkg.id && setSelectedPackage(pkg)
                }
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{pkg.name}</CardTitle>
                    {currentPackage?.id === pkg.id && (
                      <Badge>Current Plan</Badge>
                    )}
                  </div>
                  <CardDescription>{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-3xl font-bold">
                    ${pkg.price}
                    <span className="text-sm font-normal text-muted-foreground">
                      /month
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span>{pkg.maxFolders} folders</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span>{pkg.maxNestingLevel} nesting levels</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span>{pkg.filesPerFolder} files per folder</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span>
                        {formatBytes(Number(pkg.maxFileSize))} max file size
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckIcon className="h-4 w-4 text-green-600" />
                      <span>
                        {formatBytes(Number(pkg.totalFileLimit))} total storage
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowChangeDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleChangePackage}
              disabled={!selectedPackage || actionLoading}
            >
              {actionLoading ? "Changing..." : "Change Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
