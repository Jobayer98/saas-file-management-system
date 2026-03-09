"use client";

import { useState, useEffect } from "react";
import { folderService, fileService } from "@/lib/api/services";
import { Folder, FileItem } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  MoreHorizontalIcon,
  DownloadIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  SearchIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EyeIcon,
  MoveIcon,
  CopyIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FilePreviewModal } from "@/components/file-preview";
import { MoveCopyDialog } from "./move-copy-dialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface FolderFileViewProps {
  folderId?: string | null;
  onFolderOpen?: (folderId: string) => void;
  onRefresh?: () => void;
  viewMode?: "list" | "grid";
  searchQuery?: string;
  className?: string;
}

type SortField = "name" | "size" | "createdAt";
type SortDirection = "asc" | "desc";

export function FolderFileView({
  folderId,
  onFolderOpen,
  onRefresh,
  viewMode = "list",
  searchQuery = "",
  className,
}: FolderFileViewProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // Dialog states
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renamingItem, setRenamingItem] = useState<{
    id: string;
    name: string;
    type: "folder" | "file";
  } | null>(null);
  const [newName, setNewName] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // File preview states
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Move/Copy states
  const [moveCopyItem, setMoveCopyItem] = useState<{
    id: string;
    name: string;
    type: "folder" | "file";
    currentFolderId?: string | null;
  } | null>(null);
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
    loadContent();
  }, [folderId]);

  const loadContent = async () => {
    try {
      setLoading(true);
      const data = await folderService.getFolders(folderId || undefined);
      setFolders(data.folders || []);
      setFiles(data.files || []);
    } catch (error: any) {
      toast.error("Failed to load content");
      console.error("Error loading content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedFolders = [...folders].sort((a, b) => {
    const aValue = a[sortField === "size" ? "name" : sortField];
    const bValue = b[sortField === "size" ? "name" : sortField];

    if (sortField === "createdAt") {
      const aDate = new Date(aValue as string);
      const bDate = new Date(bValue as string);
      return sortDirection === "asc"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    const aStr = String(aValue).toLowerCase();
    const bStr = String(bValue).toLowerCase();
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const sortedFiles = [...files].sort((a, b) => {
    let aValue: any = a[sortField];
    let bValue: any = b[sortField];

    if (sortField === "size") {
      aValue = Number(aValue);
      bValue = Number(bValue);
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else if (sortField === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
      return sortDirection === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    } else {
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
  });

  const filteredFolders = searchQuery
    ? sortedFolders.filter((folder) =>
        folder.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sortedFolders;

  const filteredFiles = searchQuery
    ? sortedFiles.filter((file) =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : sortedFiles;

  const handleFolderDoubleClick = (folder: Folder) => {
    onFolderOpen?.(folder.id);
  };

  const handleRenameFolder = async () => {
    if (!renamingItem || !newName.trim()) return;

    try {
      setActionLoading(true);
      await folderService.updateFolder(renamingItem.id, newName);
      toast.success("Folder renamed successfully");
      setShowRenameDialog(false);
      setRenamingItem(null);
      setNewName("");
      loadContent();
      onRefresh?.();
    } catch (error: any) {
      toast.error(error.message || "Failed to rename folder");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenameFile = async () => {
    if (!renamingItem || !newName.trim()) return;

    try {
      setActionLoading(true);
      await fileService.renameFile(renamingItem.id, newName);
      toast.success("File renamed successfully");
      setShowRenameDialog(false);
      setRenamingItem(null);
      setNewName("");
      loadContent();
    } catch (error: any) {
      toast.error(error.message || "Failed to rename file");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFolder = async (folder: Folder) => {
    setConfirmDialog({
      open: true,
      title: "Delete Folder",
      description: `Are you sure you want to delete "${folder.name}"? This will also delete all contents and cannot be undone.`,
      onConfirm: async () => {
        try {
          await folderService.deleteFolder(folder.id);
          toast.success("Folder deleted successfully");
          loadContent();
          onRefresh?.();
        } catch (error: any) {
          toast.error(error.message || "Failed to delete folder");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDeleteFile = async (file: FileItem) => {
    setConfirmDialog({
      open: true,
      title: "Delete File",
      description: `Are you sure you want to delete "${file.originalName}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await fileService.deleteFile(file.id);
          toast.success("File deleted successfully");
          loadContent();
        } catch (error: any) {
          toast.error(error.message || "Failed to delete file");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleDownloadFile = async (file: FileItem) => {
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

  const handleToggleFavorite = async (file: FileItem) => {
    try {
      await fileService.toggleFavorite(file.id, !file.isFavorite);
      toast.success(
        file.isFavorite ? "Removed from favorites" : "Added to favorites",
      );
      loadContent();
    } catch (error) {
      toast.error("Failed to update favorite status");
    }
  };

  const openRenameDialog = (
    id: string,
    name: string,
    type: "folder" | "file",
  ) => {
    setRenamingItem({ id, name, type });
    setNewName(name);
    setShowRenameDialog(true);
  };

  const handlePreviewFile = (file: FileItem) => {
    setPreviewFile(file);
    setIsPreviewOpen(true);
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

  const handleMoveFolder = (folder: Folder) => {
    setMoveCopyItem({
      id: folder.id,
      name: folder.name,
      type: "folder",
      currentFolderId: folder.parentId,
    });
    setMoveCopyMode("move");
    setIsMoveCopyOpen(true);
  };

  const handleCopyFolder = (folder: Folder) => {
    setMoveCopyItem({
      id: folder.id,
      name: folder.name,
      type: "folder",
      currentFolderId: folder.parentId,
    });
    setMoveCopyMode("copy");
    setIsMoveCopyOpen(true);
  };

  const handleMoveFile = (file: FileItem) => {
    setMoveCopyItem({
      id: file.id,
      name: file.originalName,
      type: "file",
      currentFolderId: file.folderId,
    });
    setMoveCopyMode("move");
    setIsMoveCopyOpen(true);
  };

  const handleCopyFile = (file: FileItem) => {
    setMoveCopyItem({
      id: file.id,
      name: file.originalName,
      type: "file",
      currentFolderId: file.folderId,
    });
    setMoveCopyMode("copy");
    setIsMoveCopyOpen(true);
  };

  const handleMoveCopyConfirm = async (targetFolderId: string | null) => {
    if (!moveCopyItem) return;

    try {
      if (moveCopyItem.type === "folder") {
        if (moveCopyMode === "move") {
          await folderService.moveFolder(moveCopyItem.id, targetFolderId);
          toast.success("Folder moved successfully");
        } else {
          await folderService.copyFolder(moveCopyItem.id, targetFolderId);
          toast.success("Folder copied successfully");
        }
      } else {
        if (moveCopyMode === "move") {
          await fileService.moveFile(moveCopyItem.id, targetFolderId);
          toast.success("File moved successfully");
        } else {
          await fileService.copyFile(moveCopyItem.id, targetFolderId);
          toast.success("File copied successfully");
        }
      }
      loadContent();
      onRefresh?.();
    } catch (error: any) {
      toast.error(
        error.message || `Failed to ${moveCopyMode} ${moveCopyItem.type}`,
      );
      throw error;
    }
  };

  const getFileIcon = (mimeType: string, fileUrl?: string) => {
    if (mimeType.startsWith("image/")) {
      return fileUrl ? (
        <img
          src={fileUrl}
          alt="Preview"
          className="h-4 w-4 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = "";
            e.currentTarget.style.display = "none";
            e.currentTarget.nextElementSibling?.classList.remove("hidden");
          }}
        />
      ) : (
        <ImageIcon className="h-4 w-4 text-blue-500" />
      );
    }
    if (mimeType.startsWith("video/"))
      return <VideoIcon className="h-4 w-4 text-purple-500" />;
    return <FileIcon className="h-4 w-4 text-gray-500" />;
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

  const getGridFileIcon = (file: FileItem) => {
    if (file.mimeType.startsWith("image/")) {
      const fileUrl = `/api/files/${file.id}/preview`;
      return (
        <div className="relative w-16 h-16 mx-auto mb-2">
          <img
            src={fileUrl}
            alt={file.originalName}
            className="w-full h-full object-cover rounded-lg border"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <ImageIcon className="hidden w-16 h-16 text-blue-500 mx-auto" />
        </div>
      );
    }

    if (file.mimeType.startsWith("video/")) {
      return (
        <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center bg-purple-50 rounded-lg border">
          <VideoIcon className="h-8 w-8 text-purple-500" />
        </div>
      );
    }

    // Default file icon
    return (
      <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center bg-gray-50 rounded-lg border">
        <FileIcon className="h-8 w-8 text-gray-500" />
      </div>
    );
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
      className="h-auto p-0 font-medium hover:bg-transparent"
    >
      {children}
      {sortField === field &&
        (sortDirection === "asc" ? (
          <ArrowUpIcon className="ml-1 h-3 w-3" />
        ) : (
          <ArrowDownIcon className="ml-1 h-3 w-3" />
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
      {/* List View */}
      {viewMode === "list" && (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox disabled />
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    {searchQuery
                      ? "No items match your search"
                      : "This folder is empty"}
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {/* Folders */}
                  {filteredFolders.map((folder) => (
                    <TableRow
                      key={`folder-${folder.id}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onDoubleClick={() => handleFolderDoubleClick(folder)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <FolderIcon className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">{folder.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">—</TableCell>
                      <TableCell>{formatDate(folder.createdAt)}</TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handleFolderDoubleClick(folder)}
                            >
                              <FolderIcon className="h-4 w-4 mr-2" />
                              Open
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openRenameDialog(
                                  folder.id,
                                  folder.name,
                                  "folder",
                                )
                              }
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Rename
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleMoveFolder(folder)}
                            >
                              <MoveIcon className="h-4 w-4 mr-2" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyFolder(folder)}
                            >
                              <CopyIcon className="h-4 w-4 mr-2" />
                              Copy
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
                      </TableCell>
                    </TableRow>
                  ))}

                  {/* Files */}
                  {filteredFiles.map((file) => (
                    <TableRow
                      key={`file-${file.id}`}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handlePreviewFile(file)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            {file.mimeType.startsWith("image/") ? (
                              <div className="relative">
                                <img
                                  src={`/api/files/${file.id}/preview`}
                                  alt={file.originalName}
                                  className="h-8 w-8 object-cover rounded border"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.nextElementSibling?.classList.remove(
                                      "hidden",
                                    );
                                  }}
                                />
                                <ImageIcon className="hidden h-4 w-4 text-blue-500" />
                              </div>
                            ) : (
                              getFileIcon(file.mimeType)
                            )}
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {file.originalName}
                              </span>
                              {file.isFavorite && (
                                <StarIcon className="h-3 w-3 text-yellow-500 fill-current" />
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatFileSize(file.size)}</TableCell>
                      <TableCell>{formatDate(file.createdAt)}</TableCell>
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
                            <DropdownMenuItem
                              onClick={() => handlePreviewFile(file)}
                            >
                              <EyeIcon className="h-4 w-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDownloadFile(file)}
                            >
                              <DownloadIcon className="h-4 w-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                openRenameDialog(
                                  file.id,
                                  file.originalName,
                                  "file",
                                )
                              }
                            >
                              <EditIcon className="h-4 w-4 mr-2" />
                              Rename
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
                            <DropdownMenuItem
                              onClick={() => handleMoveFile(file)}
                            >
                              <MoveIcon className="h-4 w-4 mr-2" />
                              Move
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyFile(file)}
                            >
                              <CopyIcon className="h-4 w-4 mr-2" />
                              Copy
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteFile(file)}
                              className="text-red-600"
                            >
                              <TrashIcon className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div>
          {filteredFolders.length === 0 && filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery
                ? "No items match your search"
                : "This folder is empty"}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Folders */}
              {filteredFolders.map((folder) => (
                <div
                  key={`folder-${folder.id}`}
                  className="group relative border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onDoubleClick={() => handleFolderDoubleClick(folder)}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-white text-gray-900"
                        align="end"
                      >
                        <DropdownMenuItem
                          onClick={() => handleFolderDoubleClick(folder)}
                        >
                          <FolderIcon className="h-4 w-4 mr-2" />
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            openRenameDialog(folder.id, folder.name, "folder")
                          }
                        >
                          <EditIcon className="h-4 w-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleMoveFolder(folder)}
                        >
                          <MoveIcon className="h-4 w-4 mr-2" />
                          Move
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleCopyFolder(folder)}
                        >
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy
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
                  <div className="flex flex-col items-center space-y-2">
                    <FolderIcon className="h-12 w-12 text-blue-500" />
                    <p
                      className="text-sm font-medium text-center truncate w-full"
                      title={folder.name}
                    >
                      {folder.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(folder.createdAt)}
                    </p>
                  </div>
                </div>
              ))}

              {/* Files */}
              {filteredFiles.map((file) => (
                <div
                  key={`file-${file.id}`}
                  className="group relative border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => handlePreviewFile(file)}
                >
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-white text-gray-900"
                        align="end"
                      >
                        <DropdownMenuItem
                          onClick={() => handlePreviewFile(file)}
                        >
                          <EyeIcon className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadFile(file)}
                        >
                          <DownloadIcon className="h-4 w-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            openRenameDialog(file.id, file.originalName, "file")
                          }
                        >
                          <EditIcon className="h-4 w-4 mr-2" />
                          Rename
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
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteFile(file)}
                          className="text-red-600"
                        >
                          <TrashIcon className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex flex-col items-center space-y-2">
                    {getGridFileIcon(file)}
                    <p
                      className="text-sm font-medium text-center truncate w-full"
                      title={file.originalName}
                    >
                      {file.originalName}
                    </p>
                    <div className="text-xs text-muted-foreground text-center">
                      <p>{formatFileSize(file.size)}</p>
                      <p>{formatDate(file.createdAt)}</p>
                    </div>
                    {file.isFavorite && (
                      <StarIcon className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Rename {renamingItem?.type === "folder" ? "Folder" : "File"}
            </DialogTitle>
            <DialogDescription>
              Enter a new name for "{renamingItem?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newName">New Name</Label>
              <Input
                id="newName"
                placeholder="Enter new name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    renamingItem?.type === "folder"
                      ? handleRenameFolder()
                      : handleRenameFile();
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
            <Button
              onClick={
                renamingItem?.type === "folder"
                  ? handleRenameFolder
                  : handleRenameFile
              }
              disabled={actionLoading}
            >
              {actionLoading ? "Renaming..." : "Rename"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={handleClosePreview}
        onFileUpdate={handleFileUpdate}
      />

      {/* Move/Copy Dialog */}
      {moveCopyItem && (
        <MoveCopyDialog
          open={isMoveCopyOpen}
          onOpenChange={setIsMoveCopyOpen}
          onConfirm={handleMoveCopyConfirm}
          mode={moveCopyMode}
          itemType={moveCopyItem.type}
          itemName={moveCopyItem.name}
          currentFolderId={moveCopyItem.currentFolderId}
          excludeFolderIds={
            moveCopyItem.type === "folder" ? [moveCopyItem.id] : []
          }
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
