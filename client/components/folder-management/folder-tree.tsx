"use client";

import { useState, useEffect } from "react";
import { folderService } from "@/lib/api/services";
import { Folder } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  FolderIcon,
  FolderOpenIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  PlusIcon,
  MoreHorizontalIcon,
  EditIcon,
  TrashIcon,
  FolderInputIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderTreeProps {
  onFolderSelect?: (folderId: string | null) => void;
  selectedFolderId?: string | null;
  className?: string;
}

interface TreeFolder extends Folder {
  children?: TreeFolder[];
  isExpanded?: boolean;
}

export function FolderTree({
  onFolderSelect,
  selectedFolderId,
  className,
}: FolderTreeProps) {
  const [folders, setFolders] = useState<TreeFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadFolderTree();
  }, []);

  const loadFolderTree = async () => {
    try {
      setLoading(true);
      const tree = await folderService.getFolderTree();
      setFolders(tree);
    } catch (error: any) {
      toast.error("Failed to load folders");
      console.error("Error loading folder tree:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
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
        parentFolderId || undefined,
      );
      toast.success("Folder created successfully");
      setShowCreateDialog(false);
      setNewFolderName("");
      setParentFolderId(null);
      loadFolderTree();
    } catch (error: any) {
      toast.error(error.message || "Failed to create folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameFolder = async () => {
    if (!selectedFolder || !newFolderName.trim()) {
      toast.error("Folder name is required");
      return;
    }

    try {
      setActionLoading(true);
      await folderService.updateFolder(selectedFolder.id, newFolderName);
      toast.success("Folder renamed successfully");
      setShowRenameDialog(false);
      setNewFolderName("");
      setSelectedFolder(null);
      loadFolderTree();
    } catch (error: any) {
      toast.error(error.message || "Failed to rename folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    if (
      !confirm(
        `Are you sure you want to delete "${folder.name}"? This will also delete all files and subfolders inside it.`,
      )
    ) {
      return;
    }

    try {
      await folderService.deleteFolder(folder.id);
      toast.success("Folder deleted successfully");
      loadFolderTree();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete folder");
    }
  };

  const openCreateDialog = (parentId: string | null = null) => {
    setParentFolderId(parentId);
    setNewFolderName("");
    setShowCreateDialog(true);
  };

  const openRenameDialog = (folder: Folder) => {
    setSelectedFolder(folder);
    setNewFolderName(folder.name);
    setShowRenameDialog(true);
  };

  const renderFolder = (folder: TreeFolder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const hasChildren = folder.children && folder.children.length > 0;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center space-x-1 py-1 px-2 rounded-md hover:bg-muted cursor-pointer group",
            isSelected && "bg-muted",
          )}
          style={{ paddingLeft: `${level * 16 + 8}px` }}
        >
          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          <div
            className="flex items-center space-x-2 flex-1 min-w-0"
            onClick={() => onFolderSelect?.(folder.id)}
          >
            {isExpanded ? (
              <FolderOpenIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
              <FolderIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
            )}
            <span className="text-sm truncate">{folder.name}</span>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
              >
                <MoreHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white text-gray-900">
              <DropdownMenuItem onClick={() => openCreateDialog(folder.id)}>
                <PlusIcon className="h-4 w-4 mr-2" />
                New Subfolder
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openRenameDialog(folder)}>
                <EditIcon className="h-4 w-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDeleteFolder(folder)}
                className="text-red-600"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isExpanded && hasChildren && (
          <div>
            {folder.children!.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between p-2">
        <h3 className="text-sm font-medium">Folders</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => openCreateDialog(null)}
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div
        className={cn(
          "py-1 px-2 rounded-md hover:bg-muted cursor-pointer",
          selectedFolderId === null && "bg-muted",
        )}
        onClick={() => onFolderSelect?.(null)}
      >
        <div className="flex items-center space-x-2">
          <FolderIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm">All Files</span>
        </div>
      </div>

      <div className="space-y-0.5">
        {folders.map((folder) => renderFolder(folder))}
      </div>

      {folders.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <FolderIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No folders yet</p>
          <Button
            variant="link"
            size="sm"
            onClick={() => openCreateDialog(null)}
          >
            Create your first folder
          </Button>
        </div>
      )}

      {/* Create Folder Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              {parentFolderId
                ? "Create a subfolder in the selected folder"
                : "Create a new folder in the root directory"}
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
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={actionLoading}>
              {actionLoading ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rename Folder Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>
              Enter a new name for "{selectedFolder?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newFolderName">New Name</Label>
              <Input
                id="newFolderName"
                placeholder="Enter new folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleRenameFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRenameDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRenameFolder} disabled={actionLoading}>
              {actionLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
