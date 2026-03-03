"use client";

import { useState } from "react";
import { FileUploadZone } from "@/components/file-upload/file-upload-zone";
import { FolderTree } from "@/components/folder-management/folder-tree";
import { FolderBreadcrumb } from "@/components/folder-management/folder-breadcrumb";
import { FolderFileView } from "@/components/file-management/folder-file-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  UploadIcon,
  RefreshCwIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  FolderPlusIcon,
  GridIcon,
  ListIcon,
  SearchIcon,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { folderService } from "@/lib/api/services";
import { toast } from "sonner";

export default function FilesPage() {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showUpload, setShowUpload] = useState(false);
  const [isFolderSidebarCollapsed, setIsFolderSidebarCollapsed] =
    useState(false);
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [searchQuery, setSearchQuery] = useState("");

  const handleUploadComplete = (files: any[]) => {
    setRefreshKey((prev) => prev + 1);
    setShowUpload(false);
  };

  const handleFolderSelect = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleFolderOpen = (folderId: string) => {
    setCurrentFolderId(folderId);
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      setActionLoading(true);
      await folderService.createFolder(
        newFolderName,
        currentFolderId || undefined,
      );
      toast.success("Folder created successfully");
      setShowCreateFolderDialog(false);
      setNewFolderName("");
      handleRefresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to create folder");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden -m-6">
      {/* Folder Sidebar */}
      {!isFolderSidebarCollapsed && (
        <div className="w-64 border-r bg-card overflow-y-auto">
          <FolderTree
            selectedFolderId={currentFolderId}
            onFolderSelect={handleFolderSelect}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Title and Search Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setIsFolderSidebarCollapsed(!isFolderSidebarCollapsed)
                }
              >
                {isFolderSidebarCollapsed ? (
                  <PanelLeftOpenIcon className="h-4 w-4" />
                ) : (
                  <PanelLeftCloseIcon className="h-4 w-4" />
                )}
              </Button>
              <h1 className="text-3xl font-bold">Files & Folders</h1>
            </div>
            <div className="flex-1 max-w-md mx-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Breadcrumb and Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <FolderBreadcrumb
                folderId={currentFolderId}
                onNavigate={handleFolderSelect}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="rounded-r-none"
                >
                  <ListIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="rounded-l-none"
                >
                  <GridIcon className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleRefresh}>
                <RefreshCwIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateFolderDialog(true)}
              >
                <FolderPlusIcon className="h-4 w-4 mr-2" />
                New Folder
              </Button>
              <Button onClick={() => setShowUpload(!showUpload)}>
                <UploadIcon className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </div>
          </div>

          {showUpload && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
              </CardHeader>
              <CardContent>
                <FileUploadZone
                  folderId={currentFolderId || undefined}
                  onUploadComplete={handleUploadComplete}
                  maxFiles={10}
                  maxFileSize={50 * 1024 * 1024} // 50MB for quick upload
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="p-6">
              <FolderFileView
                key={refreshKey}
                folderId={currentFolderId}
                onFolderOpen={handleFolderOpen}
                onRefresh={handleRefresh}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Folder Dialog */}
      <Dialog
        open={showCreateFolderDialog}
        onOpenChange={setShowCreateFolderDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Create a new folder in the current location
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="folderName">Folder Name</Label>
              <Input
                id="folderName"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateFolderDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
