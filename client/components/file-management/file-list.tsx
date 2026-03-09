"use client";

import { useState, useEffect, useMemo } from "react";
import { fileService } from "@/lib/api/services";
import { FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileIcon,
  ImageIcon,
  VideoIcon,
  VolumeXIcon as AudioIcon,
  ArchiveIcon,
  FileTextIcon,
  MoreHorizontalIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  ShareIcon,
  EyeIcon,
  ArrowUpIcon as SortAscIcon,
  ArrowDownIcon as SortDescIcon,
  SearchIcon,
  MoveIcon,
  CopyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "@/components/file-preview";
import { MoveCopyDialog } from "./move-copy-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface FileListProps {
  folderId?: string;
  onFileSelect?: (file: FileItem) => void;
  onFilesChange?: () => void;
  className?: string;
}

type SortField = "name" | "size" | "createdAt" | "updatedAt";
type SortDirection = "asc" | "desc";

export function FileList({
  folderId,
  onFileSelect,
  onFilesChange,
  className,
}: FileListProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [moveCopyFile, setMoveCopyFile] = useState<FileItem | null>(null);
  const [moveCopyMode, setMoveCopyMode] = useState<"move" | "copy">("move");
  const [isMoveCopyOpen, setIsMoveCopyOpen] = useState(false);

  // Confirm dialog states
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    loadFiles();
  }, [folderId]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles(folderId);
      setFiles(response.data?.items || []);
    } catch (error: any) {
      toast.error("Failed to load files");
      console.error("Error loading files:", error);
      setFiles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedFiles = useMemo(() => {
    let filtered = files;

    // Apply search filter
    if (searchQuery) {
      filtered = files.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.originalName.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === "size") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (sortField === "createdAt" || sortField === "updatedAt") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [files, searchQuery, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectFile = (fileId: string, selected: boolean) => {
    const newSelected = new Set(selectedFiles);
    if (selected) {
      newSelected.add(fileId);
    } else {
      newSelected.delete(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedFiles(new Set(filteredAndSortedFiles.map((f) => f.id)));
    } else {
      setSelectedFiles(new Set());
    }
  };

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

  const handleDelete = async (file: FileItem) => {
    setConfirmDialog({
      open: true,
      title: "Delete File",
      description: `Are you sure you want to delete "${file.originalName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await fileService.deleteFile(file.id);
          toast.success("File deleted successfully");
          loadFiles();
          onFilesChange?.();
        } catch (error) {
          toast.error("Failed to delete file");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleToggleFavorite = async (file: FileItem) => {
    try {
      await fileService.toggleFavorite(file.id, !file.isFavorite);
      toast.success(
        file.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
      loadFiles();
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.size === 0) return;

    setConfirmDialog({
      open: true,
      title: "Delete Files",
      description: `Are you sure you want to delete ${selectedFiles.size} file(s)? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await fileService.bulkDelete(Array.from(selectedFiles));
          toast.success(`Deleted ${selectedFiles.size} file(s)`);
          setSelectedFiles(new Set());
          loadFiles();
          onFilesChange?.();
        } catch (error) {
          toast.error("Failed to delete files");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleBulkFavorite = async () => {
    if (selectedFiles.size === 0) return;

    try {
      await fileService.bulkFavorite(Array.from(selectedFiles));
      toast.success(`Added ${selectedFiles.size} file(s) to favorites`);
      setSelectedFiles(new Set());
      loadFiles();
    } catch (error) {
      toast.error("Failed to update favorites");
    }
  };

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
    onFileSelect?.(file);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setPreviewFile(null);
  };

  const handleFileUpdate = (updatedFile: FileItem) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === updatedFile.id ? updatedFile : f)),
    );
    setPreviewFile(updatedFile);
  };

  const handleMoveFile = (file: FileItem) => {
    setMoveCopyFile(file);
    setMoveCopyMode("move");
    setIsMoveCopyOpen(true);
  };

  const handleCopyFile = (file: FileItem) => {
    setMoveCopyFile(file);
    setMoveCopyMode("copy");
    setIsMoveCopyOpen(true);
  };

  const handleMoveCopyConfirm = async (targetFolderId: string | null) => {
    if (!moveCopyFile) return;

    try {
      if (moveCopyMode === "move") {
        await fileService.moveFile(moveCopyFile.id, targetFolderId);
        toast.success("File moved successfully");
      } else {
        await fileService.copyFile(moveCopyFile.id, targetFolderId);
        toast.success("File copied successfully");
      }
      loadFiles();
      onFilesChange?.();
    } catch (error: any) {
      toast.error(error.message || `Failed to ${moveCopyMode} file`);
      throw error;
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) return <ImageIcon className="h-4 w-4" />;
    if (mimeType.startsWith("video/")) return <VideoIcon className="h-4 w-4" />;
    if (mimeType.startsWith("audio/")) return <AudioIcon className="h-4 w-4" />;
    if (
      mimeType.includes("zip") ||
      mimeType.includes("rar") ||
      mimeType.includes("tar")
    ) {
      return <ArchiveIcon className="h-4 w-4" />;
    }
    if (mimeType.includes("text") || mimeType.includes("document")) {
      return <FileTextIcon className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
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

  const SortButton = ({
    field,
    children,
  }: {
    field: SortField;
    children: React.ReactNode;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => handleSort(field)}
      className="h-auto p-0 font-medium"
    >
      {children}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <SortAscIcon className="ml-1 h-3 w-3" />
        ) : (
          <SortDescIcon className="ml-1 h-3 w-3" />
        ))}
    </Button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search and Bulk Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {selectedFiles.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedFiles.size} selected
            </span>
            <Button onClick={handleBulkFavorite} variant="outline" size="sm">
              <StarIcon className="h-4 w-4 mr-1" />
              Favorite
            </Button>
            <Button onClick={handleBulkDelete} variant="outline" size="sm">
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* File Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedFiles.size === filteredAndSortedFiles.length &&
                    filteredAndSortedFiles.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <SortButton field="name">Name</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="size">Size</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="createdAt">Created</SortButton>
              </TableHead>
              <TableHead>
                <SortButton field="updatedAt">Modified</SortButton>
              </TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedFiles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  {searchQuery
                    ? "No files match your search"
                    : "No files in this folder"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedFiles.map((file) => (
                <TableRow
                  key={file.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handlePreviewFile(file)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedFiles.has(file.id)}
                      onCheckedChange={(checked) =>
                        handleSelectFile(file.id, !!checked)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.mimeType)}
                      <div className="flex flex-col">
                        <span className="font-medium">{file.originalName}</span>
                        <div className="flex items-center space-x-2">
                          {file.isFavorite && (
                            <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                          {file.version > 1 && (
                            <Badge variant="secondary" className="text-xs">
                              v{file.version}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>{formatDate(file.createdAt)}</TableCell>
                  <TableCell>{formatDate(file.updatedAt)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
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
                          onClick={() => handlePreviewFile(file)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleToggleFavorite(file)}
                        >
                          <StarIcon className="h-4 w-4 mr-2" />
                          {file.isFavorite
                            ? "Remove from favorites"
                            : "Add to favorites"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleMoveFile(file)}>
                          <MoveIcon className="h-4 w-4 mr-2" />
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyFile(file)}>
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <EditIcon className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ShareIcon className="h-4 w-4 mr-2" />
                          Share
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
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onFileUpdate={handleFileUpdate}
      />

      {/* Move/Copy Dialog */}
      {moveCopyFile && (
        <MoveCopyDialog
          open={isMoveCopyOpen}
          onOpenChange={setIsMoveCopyOpen}
          onConfirm={handleMoveCopyConfirm}
          mode={moveCopyMode}
          itemType="file"
          itemName={moveCopyFile.originalName}
          currentFolderId={moveCopyFile.folderId}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="destructive"
        confirmText="Delete"
      />
    </div>
  );
}
