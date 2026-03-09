"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { folderService } from "@/lib/api/services";
import { Folder } from "@/types";
import { FolderIcon, ChevronRightIcon, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoveCopyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (targetFolderId: string | null) => Promise<void>;
  mode: "move" | "copy";
  itemType: "file" | "folder";
  itemName: string;
  currentFolderId?: string | null;
  excludeFolderIds?: string[]; // Folders to exclude from selection (e.g., the folder being moved)
}

export function MoveCopyDialog({
  open,
  onOpenChange,
  onConfirm,
  mode,
  itemType,
  itemName,
  currentFolderId,
  excludeFolderIds = [],
}: MoveCopyDialogProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      loadFolders();
      setSelectedFolderId(null);
    }
  }, [open]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const tree = await folderService.getFolderTree();
      setFolders(tree);
    } catch (error) {
      console.error("Failed to load folders:", error);
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

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm(selectedFolderId);
      onOpenChange(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setSubmitting(false);
    }
  };

  const isExcluded = (folderId: string): boolean => {
    return excludeFolderIds.includes(folderId);
  };

  const renderFolder = (folder: Folder, level: number = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const hasChildren = folder.children && folder.children.length > 0;
    const excluded = isExcluded(folder.id);
    const isSelected = selectedFolderId === folder.id;
    const isCurrent = currentFolderId === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
            isSelected && "bg-primary/10 hover:bg-primary/15",
            excluded && "opacity-50 cursor-not-allowed",
            isCurrent && mode === "move" && "opacity-50 cursor-not-allowed",
          )}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => {
            if (!excluded && !(isCurrent && mode === "move")) {
              setSelectedFolderId(folder.id);
            }
          }}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(folder.id);
              }}
              className="p-0.5 hover:bg-muted rounded"
            >
              <ChevronRightIcon
                className={cn(
                  "h-4 w-4 transition-transform",
                  isExpanded && "transform rotate-90",
                )}
              />
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          <FolderIcon className="h-4 w-4 text-blue-500" />
          <span className="text-sm flex-1">{folder.name}</span>
          {isCurrent && mode === "move" && (
            <span className="text-xs text-muted-foreground">(current)</span>
          )}
          {excluded && (
            <span className="text-xs text-muted-foreground">(excluded)</span>
          )}
        </div>
        {isExpanded && hasChildren && (
          <div>
            {folder.children?.map((child) => renderFolder(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const actionText = mode === "move" ? "Move" : "Copy";
  const actioningText = mode === "move" ? "Moving" : "Copying";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {actionText} {itemType === "file" ? "File" : "Folder"}
          </DialogTitle>
          <DialogDescription>
            Select a destination folder for "{itemName}"
            {mode === "move" && " or select root to move to the root folder"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Root folder option */}
          <div
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors",
              selectedFolderId === null && "bg-primary/10 hover:bg-primary/15",
              currentFolderId === null &&
                mode === "move" &&
                "opacity-50 cursor-not-allowed",
            )}
            onClick={() => {
              if (!(currentFolderId === null && mode === "move")) {
                setSelectedFolderId(null);
              }
            }}
          >
            <HomeIcon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Root Folder</span>
            {currentFolderId === null && mode === "move" && (
              <span className="text-xs text-muted-foreground ml-auto">
                (current)
              </span>
            )}
          </div>

          {/* Folder tree */}
          <ScrollArea className="h-[300px] border rounded-md p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : folders.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No folders available
              </div>
            ) : (
              <div className="space-y-1">
                {folders.map((folder) => renderFolder(folder))}
              </div>
            )}
          </ScrollArea>

          {selectedFolderId === null && (
            <p className="text-sm text-muted-foreground">
              {mode === "move"
                ? "The item will be moved to the root folder"
                : "The item will be copied to the root folder"}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={
              submitting ||
              (currentFolderId === selectedFolderId && mode === "move")
            }
          >
            {submitting ? actioningText : actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
