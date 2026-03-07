"use client";

import { useState, useEffect } from "react";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DownloadIcon,
  FolderIcon,
  FileIcon,
  ArchiveIcon,
  AlertCircleIcon,
} from "lucide-react";

interface ArchivePreviewProps {
  file: FileItem;
  previewUrl: string;
}

interface ArchiveEntry {
  name: string;
  size: number;
  type: "file" | "directory";
  path: string;
  compressedSize?: number;
  lastModified?: string;
}

export function ArchivePreview({ file, previewUrl }: ArchivePreviewProps) {
  const [entries, setEntries] = useState<ArchiveEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState("");

  useEffect(() => {
    loadArchiveContents();
  }, [previewUrl]);

  const loadArchiveContents = async () => {
    try {
      setLoading(true);
      setError(null);

      // This would typically call an API endpoint that extracts archive contents
      // For now, we'll simulate the response
      const response = await fetch(`${previewUrl}/contents`);
      if (!response.ok) {
        throw new Error("Failed to load archive contents");
      }

      const data = await response.json();
      setEntries(data.entries || []);
    } catch (err: any) {
      // Fallback: show basic archive info without contents
      setError("Archive contents preview not available");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const getArchiveType = (fileName: string, mimeType: string) => {
    const extension = fileName.toLowerCase().split(".").pop();
    const archiveTypes: Record<
      string,
      { name: string; icon: string; color: string }
    > = {
      zip: { name: "ZIP Archive", icon: "🗜️", color: "blue" },
      rar: { name: "RAR Archive", icon: "📦", color: "red" },
      "7z": { name: "7-Zip Archive", icon: "📚", color: "green" },
      tar: { name: "TAR Archive", icon: "📋", color: "orange" },
      gz: { name: "GZIP Archive", icon: "🗃️", color: "purple" },
      bz2: { name: "BZIP2 Archive", icon: "📁", color: "yellow" },
    };

    return (
      archiveTypes[extension || ""] || {
        name: "Archive",
        icon: "📦",
        color: "gray",
      }
    );
  };

  const archiveInfo = getArchiveType(file.originalName, file.mimeType);

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = previewUrl;
    link.download = file.originalName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredEntries = entries.filter(
    (entry) =>
      entry.path.startsWith(currentPath) &&
      entry.path !== currentPath &&
      !entry.path.substring(currentPath.length + 1).includes("/"),
  );

  const totalFiles = entries.filter((e) => e.type === "file").length;
  const totalDirectories = entries.filter((e) => e.type === "directory").length;
  const totalUncompressedSize = entries.reduce((sum, e) => sum + e.size, 0);

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white dark:bg-gray-800">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{archiveInfo.icon}</div>
          <div>
            <h3 className="font-semibold">{file.originalName}</h3>
            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className={`bg-${archiveInfo.color}-100 text-${archiveInfo.color}-800 dark:bg-${archiveInfo.color}-900 dark:text-${archiveInfo.color}-200`}
              >
                {archiveInfo.name}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(file.size)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={downloadFile}>
            <DownloadIcon className="h-4 w-4 mr-1" />
            Download
          </Button>
        </div>
      </div>

      {/* Archive Stats */}
      {!loading && !error && entries.length > 0 && (
        <div className="p-4 border-b bg-white dark:bg-gray-800">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {totalFiles}
              </div>
              <div className="text-sm text-muted-foreground">Files</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {totalDirectories}
              </div>
              <div className="text-sm text-muted-foreground">Folders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {formatFileSize(totalUncompressedSize)}
              </div>
              <div className="text-sm text-muted-foreground">Uncompressed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {((1 - file.size / totalUncompressedSize) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Compression</div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2 text-muted-foreground">
              Loading archive contents...
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <ArchiveIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Archive Preview</h3>
              <p className="text-muted-foreground mb-6">
                This is a {archiveInfo.name.toLowerCase()} containing compressed
                files and folders. Download and extract it to access the
                contents.
              </p>

              <Button onClick={downloadFile} className="w-full">
                <DownloadIcon className="h-4 w-4 mr-2" />
                Download {archiveInfo.name}
              </Button>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h4 className="font-medium mb-2">Archive Information:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• File size: {formatFileSize(file.size)}</li>
                  <li>• Type: {archiveInfo.name}</li>
                  <li>• Created: {formatDate(file.createdAt)}</li>
                  <li>• Modified: {formatDate(file.updatedAt)}</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && entries.length > 0 && (
          <div className="p-4">
            {/* Breadcrumb */}
            {currentPath && (
              <div className="mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPath("")}
                >
                  ← Back to root
                </Button>
                <span className="text-sm text-muted-foreground ml-2">
                  /{currentPath}
                </span>
              </div>
            )}

            {/* File List */}
            <div className="space-y-2">
              {filteredEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <div className="flex items-center space-x-3">
                    {entry.type === "directory" ? (
                      <FolderIcon className="h-5 w-5 text-blue-500" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <div>
                      <div className="font-medium">{entry.name}</div>
                      {entry.lastModified && (
                        <div className="text-xs text-muted-foreground">
                          {formatDate(entry.lastModified)}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {formatFileSize(entry.size)}
                    </div>
                    {entry.compressedSize && (
                      <div className="text-xs text-muted-foreground">
                        Compressed: {formatFileSize(entry.compressedSize)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
