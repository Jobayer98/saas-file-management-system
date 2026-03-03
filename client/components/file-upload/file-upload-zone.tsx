"use client";

import { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { fileService } from "@/lib/api/services";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import {
  UploadIcon,
  FileIcon,
  XIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  PauseIcon,
  PlayIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status:
    | "pending"
    | "uploading"
    | "completed"
    | "error"
    | "cancelled"
    | "paused";
  error?: string;
  uploadId?: string;
  uploadedChunks?: number;
  totalChunks?: number;
}

interface FileUploadZoneProps {
  folderId?: string;
  onUploadComplete?: (files: any[]) => void;
  onUploadStart?: () => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  className?: string;
}

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_FILE_SIZE_FOR_CHUNKED = 10 * 1024 * 1024; // 10MB

export function FileUploadZone({
  folderId,
  onUploadComplete,
  onUploadStart,
  maxFiles = 10,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  acceptedFileTypes,
  className,
}: FileUploadZoneProps) {
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    rejectedFiles.forEach(({ file, errors }) => {
      errors.forEach((error: any) => {
        toast.error(`${file.name}: ${error.message}`);
      });
    });

    // Add accepted files to upload queue
    const newUploadFiles: UploadFile[] = acceptedFiles.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: "pending",
    }));

    setUploadFiles((prev) => [...prev, ...newUploadFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxFileSize,
    accept: acceptedFileTypes
      ? acceptedFileTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {})
      : undefined,
    disabled: isUploading,
  });

  const uploadFile = async (uploadFile: UploadFile) => {
    const { file, id } = uploadFile;

    try {
      setUploadFiles((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "uploading" } : f)),
      );

      let result;

      if (file.size > MAX_FILE_SIZE_FOR_CHUNKED) {
        // Use chunked upload for large files
        result = await uploadFileChunked(uploadFile);
      } else {
        // Use regular upload for small files
        result = await uploadFileRegular(uploadFile);
      }

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "completed", progress: 100 } : f,
        ),
      );

      return result;
    } catch (error: any) {
      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                status: "error",
                error: error.message || "Upload failed",
              }
            : f,
        ),
      );
      throw error;
    }
  };

  const uploadFileRegular = async (uploadFile: UploadFile) => {
    const { file, id } = uploadFile;

    const abortController = new AbortController();
    abortControllers.current.set(id, abortController);

    try {
      const result = await fileService.uploadFile(file, folderId);

      // Simulate progress for regular uploads
      const progressInterval = setInterval(() => {
        setUploadFiles((prev) =>
          prev.map((f) => {
            if (f.id === id && f.progress < 90) {
              return { ...f, progress: f.progress + 10 };
            }
            return f;
          }),
        );
      }, 100);

      setTimeout(() => clearInterval(progressInterval), 1000);

      return result;
    } finally {
      abortControllers.current.delete(id);
    }
  };

  const uploadFileChunked = async (uploadFile: UploadFile) => {
    const { file, id } = uploadFile;
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

    try {
      // Initialize chunked upload
      const uploadId = await fileService.initChunkedUpload(
        file.name,
        file.size,
        file.type,
        totalChunks,
        folderId,
      );

      setUploadFiles((prev) =>
        prev.map((f) =>
          f.id === id
            ? {
                ...f,
                uploadId,
                totalChunks,
                uploadedChunks: 0,
              }
            : f,
        ),
      );

      // Upload chunks
      for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await fileService.uploadChunk(uploadId, chunk, chunkIndex);

        const progress = Math.round(((chunkIndex + 1) / totalChunks) * 100);
        setUploadFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? {
                  ...f,
                  progress,
                  uploadedChunks: chunkIndex + 1,
                }
              : f,
          ),
        );
      }

      // Complete upload
      const result = await fileService.completeChunkedUpload(uploadId);
      return result;
    } catch (error) {
      // Cancel upload on error
      if (uploadFile.uploadId) {
        try {
          await fileService.cancelUpload(uploadFile.uploadId);
        } catch (cancelError) {
          console.error("Failed to cancel upload:", cancelError);
        }
      }
      throw error;
    }
  };

  const startUploads = async () => {
    const pendingFiles = uploadFiles.filter((f) => f.status === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);
    onUploadStart?.();

    const uploadPromises = pendingFiles.map(uploadFile);

    try {
      const results = await Promise.allSettled(uploadPromises);
      const successful = results
        .filter(
          (result): result is PromiseFulfilledResult<any> =>
            result.status === "fulfilled",
        )
        .map((result) => result.value);

      if (successful.length > 0) {
        toast.success(`Successfully uploaded ${successful.length} file(s)`);
        onUploadComplete?.(successful);
      }

      const failed = results.filter(
        (result) => result.status === "rejected",
      ).length;
      if (failed > 0) {
        toast.error(`Failed to upload ${failed} file(s)`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  const cancelUpload = async (uploadFile: UploadFile) => {
    const { id, uploadId } = uploadFile;

    // Cancel API request if exists
    const abortController = abortControllers.current.get(id);
    if (abortController) {
      abortController.abort();
    }

    // Cancel chunked upload if exists
    if (uploadId) {
      try {
        await fileService.cancelUpload(uploadId);
      } catch (error) {
        console.error("Failed to cancel upload:", error);
      }
    }

    setUploadFiles((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: "cancelled" } : f)),
    );
  };

  const removeFile = (id: string) => {
    setUploadFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const clearCompleted = () => {
    setUploadFiles((prev) =>
      prev.filter(
        (f) =>
          f.status !== "completed" &&
          f.status !== "error" &&
          f.status !== "cancelled",
      ),
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getStatusIcon = (status: UploadFile["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case "error":
        return <AlertCircleIcon className="h-4 w-4 text-red-500" />;
      case "uploading":
        return (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        );
      case "cancelled":
        return <XIcon className="h-4 w-4 text-gray-500" />;
      case "paused":
        return <PauseIcon className="h-4 w-4 text-yellow-500" />;
      default:
        return <FileIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "pointer-events-none opacity-50",
            )}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop files here...</p>
            ) : (
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag & drop files here, or click to select
                </p>
                <p className="text-sm text-muted-foreground">
                  Maximum {maxFiles} files, up to {formatFileSize(maxFileSize)}{" "}
                  each
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upload Queue */}
      {uploadFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                Upload Queue ({uploadFiles.length})
              </h3>
              <div className="space-x-2">
                <Button
                  onClick={startUploads}
                  disabled={
                    isUploading ||
                    uploadFiles.every((f) => f.status !== "pending")
                  }
                  size="sm"
                >
                  {isUploading ? "Uploading..." : "Start Upload"}
                </Button>
                <Button
                  onClick={clearCompleted}
                  variant="outline"
                  size="sm"
                  disabled={
                    !uploadFiles.some(
                      (f) =>
                        f.status === "completed" ||
                        f.status === "error" ||
                        f.status === "cancelled",
                    )
                  }
                >
                  Clear Completed
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {uploadFiles.map((uploadFile) => (
                <div
                  key={uploadFile.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg"
                >
                  {getStatusIcon(uploadFile.status)}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                      {uploadFile.totalChunks && (
                        <span className="ml-2">
                          Chunk {uploadFile.uploadedChunks || 0}/
                          {uploadFile.totalChunks}
                        </span>
                      )}
                    </p>
                    {uploadFile.error && (
                      <p className="text-xs text-red-500 mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  {uploadFile.status === "uploading" && (
                    <div className="w-24">
                      <Progress value={uploadFile.progress} className="h-2" />
                      <p className="text-xs text-center mt-1">
                        {uploadFile.progress}%
                      </p>
                    </div>
                  )}

                  <div className="flex space-x-1">
                    {uploadFile.status === "uploading" && (
                      <Button
                        onClick={() => cancelUpload(uploadFile)}
                        variant="ghost"
                        size="sm"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {(uploadFile.status === "pending" ||
                      uploadFile.status === "error" ||
                      uploadFile.status === "cancelled") && (
                      <Button
                        onClick={() => removeFile(uploadFile.id)}
                        variant="ghost"
                        size="sm"
                      >
                        <XIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
