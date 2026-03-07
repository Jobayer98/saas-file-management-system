"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload/file-upload-zone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, AlertCircleIcon } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import {
  formatBytes,
  formatFileTypes,
  calculateRemainingStorage,
} from "@/lib/format-utils";

export default function UploadPage() {
  const [uploadCount, setUploadCount] = useState(0);
  const router = useRouter();
  const { data: subscriptionData, isLoading, error } = useSubscription();

  const handleUploadComplete = (files: any[]) => {
    setUploadCount((prev) => prev + files.length);
  };

  const handleUploadStart = () => {
    // Optional: Show upload started notification
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Files</h1>
            <p className="text-muted-foreground">
              Loading subscription details...
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error || !subscriptionData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Upload Files</h1>
            <p className="text-muted-foreground">
              Unable to load subscription details
            </p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircleIcon className="h-5 w-5" />
              <p>
                {error ||
                  "Failed to load subscription information. Please try again."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { package: pkg, usage } = subscriptionData;

  // Calculate dynamic values
  const maxFileSize = parseInt(pkg.maxFileSize.toString());
  const maxFiles = pkg.filesPerFolder;
  const remainingStorage = calculateRemainingStorage(
    pkg.totalFileLimit,
    usage.totalSize,
  );
  const formattedFileTypes = formatFileTypes(pkg.allowedFileTypes);

  // Check if user has enough storage
  const hasStorageSpace = remainingStorage > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeftIcon className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Upload Files</h1>
          <p className="text-muted-foreground">
            Upload files to your storage space
          </p>
        </div>
      </div>

      {!hasStorageSpace && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-orange-800">
              <AlertCircleIcon className="h-5 w-5" />
              <p>
                You have reached your storage limit. Please upgrade your plan or
                delete some files to continue uploading.
                <Button
                  variant="link"
                  className="p-0 ml-2 text-orange-600"
                  onClick={() => router.push("/dashboard/subscription")}
                >
                  Upgrade Plan
                </Button>
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadCount > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-green-800">
              Successfully uploaded {uploadCount} file(s)!
              <Button
                variant="link"
                className="p-0 ml-2 text-green-600"
                onClick={() => router.push("/dashboard/files")}
              >
                View files
              </Button>
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              Plan: <span className="font-medium capitalize">{pkg.name}</span>
            </p>
            <p>
              Storage:{" "}
              <span className="font-medium">
                {formatBytes(parseInt(usage.totalSize.toString()))} /{" "}
                {formatBytes(parseInt(pkg.totalFileLimit.toString()))}
              </span>{" "}
              ({usage.percentUsed.toFixed(1)}% used)
            </p>
            <p>
              Remaining:{" "}
              <span className="font-medium">
                {formatBytes(remainingStorage)}
              </span>
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <FileUploadZone
            onUploadComplete={handleUploadComplete}
            onUploadStart={handleUploadStart}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
            disabled={!hasStorageSpace}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Upload Guidelines -{" "}
            {pkg.name.charAt(0).toUpperCase() + pkg.name.slice(1)} Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Supported File Types</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                {formattedFileTypes.map((typeGroup, index) => (
                  <li key={index}>• {typeGroup}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Upload Limits</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Maximum file size: {formatBytes(maxFileSize)}</li>
                <li>• Maximum files per upload: {maxFiles}</li>
                <li>
                  • Total storage limit:{" "}
                  {formatBytes(parseInt(pkg.totalFileLimit.toString()))}
                </li>
                <li>• Files per folder: {pkg.filesPerFolder}</li>
                <li>• Maximum folders: {pkg.maxFolders}</li>
                <li>• Maximum nesting level: {pkg.maxNestingLevel}</li>
                {maxFileSize > 10 * 1024 * 1024 && (
                  <li>• Large files (&gt;10MB) use chunked upload</li>
                )}
                <li>• Upload progress is tracked in real-time</li>
              </ul>
            </div>
          </div>

          {usage.percentUsed > 80 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center space-x-2 text-yellow-800">
                <AlertCircleIcon className="h-4 w-4" />
                <p className="text-sm">
                  <strong>Storage Warning:</strong> You're using{" "}
                  {usage.percentUsed.toFixed(1)}% of your storage. Consider
                  upgrading your plan or managing your files.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
