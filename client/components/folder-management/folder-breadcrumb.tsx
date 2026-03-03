"use client";

import { useState, useEffect } from "react";
import { folderService } from "@/lib/api/services";
import { Folder } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, HomeIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderBreadcrumbProps {
  folderId: string | null;
  onNavigate?: (folderId: string | null) => void;
  className?: string;
}

export function FolderBreadcrumb({
  folderId,
  onNavigate,
  className,
}: FolderBreadcrumbProps) {
  const [breadcrumb, setBreadcrumb] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (folderId) {
      loadBreadcrumb();
    } else {
      setBreadcrumb([]);
    }
  }, [folderId]);

  const loadBreadcrumb = async () => {
    if (!folderId) return;

    try {
      setLoading(true);
      const path = await folderService.getBreadcrumb(folderId);
      setBreadcrumb(path);
    } catch (error) {
      console.error("Error loading breadcrumb:", error);
      setBreadcrumb([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center space-x-2 py-2", className)}>
        <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center space-x-1 py-2 overflow-x-auto",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate?.(null)}
        className="flex items-center space-x-1"
      >
        <HomeIcon className="h-4 w-4" />
        <span>Home</span>
      </Button>

      {breadcrumb.map((folder, index) => (
        <div key={folder.id} className="flex items-center space-x-1">
          <ChevronRightIcon className="h-4 w-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate?.(folder.id)}
            className={cn(index === breadcrumb.length - 1 && "font-medium")}
          >
            {folder.name}
          </Button>
        </div>
      ))}
    </div>
  );
}
