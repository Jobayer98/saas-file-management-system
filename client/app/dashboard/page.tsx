"use client";

import { useAuth } from "@/lib/auth/context";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileIcon,
  FolderIcon,
  HardDriveIcon,
  CreditCardIcon,
  UploadIcon,
  EyeIcon,
  RefreshCwIcon,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    totalFiles,
    totalFolders,
    storageUsed,
    subscriptionType,
    recentFiles,
    loading,
    error,
    refresh,
  } = useDashboardStats();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Manage your files and folders from your dashboard.
          </p>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">
              Failed to load dashboard data: {error}
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
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Manage your files and folders from your dashboard.
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
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalFiles.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalFiles === 0
                ? "No files uploaded yet"
                : "Files in your storage"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
            <FolderIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : totalFolders.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalFolders === 0
                ? "No folders created yet"
                : "Organized in folders"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDriveIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : storageUsed}
            </div>
            <p className="text-xs text-muted-foreground">Total storage used</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : subscriptionType}
            </div>
            <p className="text-xs text-muted-foreground">
              {subscriptionType === "Free" ? (
                <Link
                  href="/dashboard/subscription"
                  className="text-primary hover:underline"
                >
                  Upgrade for more features
                </Link>
              ) : (
                "Current plan"
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Get started with your file management
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/dashboard/upload">
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload Files
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/files">
                <EyeIcon className="h-4 w-4 mr-2" />
                Browse Files
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/dashboard/folders">
                <FolderIcon className="h-4 w-4 mr-2" />
                Manage Folders
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Your recently uploaded files</CardDescription>
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
            ) : recentFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No files uploaded yet.{" "}
                <Link
                  href="/dashboard/upload"
                  className="text-primary hover:underline"
                >
                  Upload your first file
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {recentFiles.map((file) => (
                  <div key={file.id} className="flex items-center space-x-3">
                    <FileIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatDate(file.createdAt)}</span>
                        {file.folder && (
                          <>
                            <span>•</span>
                            <span className="truncate">{file.folder.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {recentFiles.length >= 5 && (
                  <Button asChild variant="link" className="w-full p-0 h-auto">
                    <Link href="/dashboard/files">View all files →</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
