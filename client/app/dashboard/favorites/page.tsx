"use client";

import { useState, useEffect } from "react";
import { fileService } from "@/lib/api/services";
import { FileItem } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  StarIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  DownloadIcon,
  TrashIcon,
  MoreHorizontalIcon,
  SearchIcon,
  RefreshCwIcon,
  GridIcon,
  ListIcon,
} from "lucide-react";

export default function FavoritesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      // Get all files and filter favorites
      const response = await fileService.getFiles(undefined, 1, 100);
      const favoriteFiles =
        response.data?.items?.filter((file: FileItem) => file.isFavorite) || [];
      setFiles(favoriteFiles);
    } catch (error: any) {
      toast.error("Failed to load favorites");
      console.error("Error loading favorites:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFiles = files.filter(
    (file) =>
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDownload = async (file: FileItem) => {
    try {
      const blob = await fileService.downloadFile(file.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.originalName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File downloaded successfully");
    } catch (error) {
      toast.error("Failed to download file");
    }
  };

  const handleRemoveFavorite = async (file: FileItem) => {
    try {
      await fileService.toggleFavorite(file.id, false);
      toast.success("Removed from favorites");
      loadFavorites();
    } catch (error) {
      toast.error("Failed to remove from favorites");
    }
  };

  const handleDelete = async (file: FileItem) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    try {
      await fileService.deleteFile(file.id);
      toast.success("File deleted successfully");
      loadFavorites();
    } catch (error) {
      toast.error("Failed to delete file");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <VideoIcon className="h-8 w-8 text-purple-500" />;
    return <FileIcon className="h-8 w-8 text-gray-500" />;
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
    });
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
          <h1 className="text-3xl font-bold">Favorites</h1>
          <p className="text-muted-foreground">
            Quick access to your favorite files
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
          >
            {viewMode === "grid" ? (
              <ListIcon className="h-4 w-4" />
            ) : (
              <GridIcon className="h-4 w-4" />
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={loadFavorites}>
            <RefreshCwIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Favorite Files</CardTitle>
              <CardDescription>
                {files.length} file{files.length !== 1 ? "s" : ""} marked as
                favorite
              </CardDescription>
            </div>
            <div className="relative w-64">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredFiles.length === 0 ? (
            <div className="text-center py-12">
              <StarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">No favorite files</p>
              <p className="text-sm text-muted-foreground">
                {searchQuery
                  ? "No files match your search"
                  : "Mark files as favorites to see them here"}
              </p>
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <Card
                  key={file.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      {getFileIcon(file.mimeType)}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="bg-white text-gray-900"
                          align="end"
                        >
                          <DropdownMenuItem
                            onClick={() => handleDownload(file)}
                          >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleRemoveFavorite(file)}
                          >
                            <StarIcon className="h-4 w-4 mr-2" />
                            Remove from favorites
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDelete(file)}
                            className="text-red-600"
                          >
                            <TrashIcon className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="space-y-2">
                      <p
                        className="font-medium text-sm truncate"
                        title={file.originalName}
                      >
                        {file.originalName}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.createdAt)}</span>
                      </div>
                      {file.version > 1 && (
                        <Badge variant="secondary" className="text-xs">
                          v{file.version}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {getFileIcon(file.mimeType)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {file.originalName}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>{formatDate(file.createdAt)}</span>
                        {file.version > 1 && (
                          <Badge variant="secondary" className="text-xs">
                            v{file.version}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="bg-white text-gray-900"
                      align="end"
                    >
                      <DropdownMenuItem onClick={() => handleDownload(file)}>
                        <DownloadIcon className="h-4 w-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRemoveFavorite(file)}
                      >
                        <StarIcon className="h-4 w-4 mr-2" />
                        Remove from favorites
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(file)}
                        className="text-red-600"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
