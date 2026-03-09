"use client";

import { useState, useEffect } from "react";
import { trashService } from "@/lib/api/services";
import { FileItem, Folder } from "@/types";
import { Button } from "@/components/ui/button";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  FolderIcon,
  FileIcon,
  ImageIcon,
  VideoIcon,
  MoreHorizontalIcon,
  RotateCcwIcon,
  Trash2Icon,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatFileSize, formatDate } from "@/lib/format-utils";

export default function TrashPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
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
    loadTrashItems();
  }, []);

  const loadTrashItems = async () => {
    try {
      setLoading(true);
      const data = await trashService.getTrashItems();
      setFiles(data.files || []);
      setFolders(data.folders || []);
    } catch (error: any) {
      toast.error("Failed to load trash items");
      console.error("Error loading trash:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreFile = async (file: FileItem) => {
    try {
      await trashService.restoreFile(file.id);
      toast.success("File restored successfully");
      loadTrashItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to restore file");
    }
  };

  const handleRestoreFolder = async (folder: Folder) => {
    try {
      await trashService.restoreFolder(folder.id);
      toast.success("Folder restored successfully");
      loadTrashItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to restore folder");
    }
  };

  const handlePermanentlyDeleteFile = (file: FileItem) => {
    setConfirmDialog({
      open: true,
      title: "Permanently Delete File",
      description: `Are you sure you want to permanently delete "${file.originalName}"? This action cannot be undone and the file will be lost forever.`,
      onConfirm: async () => {
        try {
          await trashService.permanentlyDeleteFile(file.id);
          toast.success("File permanently deleted");
          loadTrashItems();
        } catch (error: any) {
          toast.error(error.message || "Failed to delete file");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handlePermanentlyDeleteFolder = (folder: Folder) => {
    setConfirmDialog({
      open: true,
      title: "Permanently Delete Folder",
      description: `Are you sure you want to permanently delete "${folder.name}" and all its contents? This action cannot be undone and all data will be lost forever.`,
      onConfirm: async () => {
        try {
          await trashService.permanentlyDeleteFolder(folder.id);
          toast.success("Folder permanently deleted");
          loadTrashItems();
        } catch (error: any) {
          toast.error(error.message || "Failed to delete folder");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const handleEmptyTrash = () => {
    setConfirmDialog({
      open: true,
      title: "Empty Trash",
      description: `Are you sure you want to empty the trash? This will permanently delete ${files.length} file(s) and ${folders.length} folder(s). This action cannot be undone.`,
      onConfirm: async () => {
        try {
          const result = await trashService.emptyTrash();
          toast.success(
            `Trash emptied: ${result.data?.deletedFiles || 0} files and ${result.data?.deletedFolders || 0} folders deleted`,
          );
          loadTrashItems();
        } catch (error: any) {
          toast.error(error.message || "Failed to empty trash");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        }
      },
    });
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/"))
      return <ImageIcon className="h-4 w-4 text-blue-500" />;
    if (mimeType.startsWith("video/"))
      return <VideoIcon className="h-4 w-4 text-purple-500" />;
    return <FileIcon className="h-4 w-4 text-gray-500" />;
  };

  const totalItems = files.length + folders.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Trash</h1>
          <p className="text-muted-foreground">
            Items in trash will be automatically deleted after 30 days
          </p>
        </div>
        {totalItems > 0 && (
          <Button
            variant="secondary"
            onClick={handleEmptyTrash}
            className="bg-red-500 text-white hover:bg-red-600"
          >
            <Trash2Icon className="h-4 w-4 mr-2" />
            Empty Trash
          </Button>
        )}
      </div>

      {totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Trash2Icon className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Trash is empty</h3>
          <p className="text-muted-foreground max-w-md">
            Items you delete will appear here. You can restore them or
            permanently delete them.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Deleted</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Folders */}
              {folders.map((folder) => (
                <TableRow key={`folder-${folder.id}`}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <FolderIcon className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">{folder.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">—</TableCell>
                  <TableCell>
                    {folder.deletedAt ? formatDate(folder.deletedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRestoreFolder(folder)}
                        >
                          <RotateCcwIcon className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePermanentlyDeleteFolder(folder)}
                          className="text-red-600"
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {/* Files */}
              {files.map((file) => (
                <TableRow key={`file-${file.id}`}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getFileIcon(file.mimeType)}
                      <span className="font-medium">{file.originalName}</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatFileSize(file.size)}</TableCell>
                  <TableCell>
                    {file.deletedAt ? formatDate(file.deletedAt) : "—"}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleRestoreFile(file)}
                        >
                          <RotateCcwIcon className="h-4 w-4 mr-2" />
                          Restore
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePermanentlyDeleteFile(file)}
                          className="text-red-600"
                        >
                          <Trash2Icon className="h-4 w-4 mr-2" />
                          Delete Forever
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant="destructive"
        confirmText="Delete Forever"
      />
    </div>
  );
}
