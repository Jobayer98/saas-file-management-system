import { AppError } from "@/middlewares/error/error.middleware";
import path from "path";
import fs from "fs/promises";
import fsSync from "fs";
import {
  InitChunkUploadInput,
  UploadUrlInput,
  RenameFileInput,
  MoveFileInput,
  CopyFileInput,
  ShareFileInput,
  BulkDeleteFilesInput,
  BulkMoveFilesInput,
  BulkFavoriteFilesInput,
} from "@/validators/file/file.validator";
import { SubscriptionRepository } from "@/repositories/subscription/subscription.repository";
import { FolderRepository } from "@/repositories/folder/folder.repository";
import { FileRepository } from "@/repositories/file/file.repository";
import { CacheService } from "@/services/cache/cache.service";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const FILES_DIR = path.join(UPLOAD_DIR, "files");
const CHUNKS_DIR = path.join(UPLOAD_DIR, "chunks");

// In-memory store for upload sessions
interface UploadSession {
  uploadId: string;
  userId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  totalChunks: number;
  receivedChunks: number;
  folderId?: string;
  createdAt: Date;
}

const uploadSessions = new Map<string, UploadSession>();

// Clean up expired sessions every 30 minutes
setInterval(
  () => {
    const now = new Date();
    for (const [uploadId, session] of uploadSessions.entries()) {
      const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      if (session.createdAt < hourAgo) {
        // Clean up chunk directory
        const chunkDir = path.join(CHUNKS_DIR, uploadId);
        fsSync.rmSync(chunkDir, { recursive: true, force: true });
        uploadSessions.delete(uploadId);
      }
    }
  },
  30 * 60 * 1000,
);

export class FileService {
  constructor(
    private fileRepository: FileRepository,
    private subscriptionRepository: SubscriptionRepository,
    private folderRepository: FolderRepository,
    private cacheService: CacheService,
  ) {}

  // Single File Upload
  async uploadFile(
    userId: string,
    file: Express.Multer.File,
    folderId?: string,
  ) {
    if (!file || !file.path || !file.size) {
      throw new AppError("Invalid file upload", 400, "INVALID_FILE");
    }

    const subscription =
      await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError(
        "No active subscription found",
        403,
        "NO_SUBSCRIPTION",
      );
    }

    if (BigInt(file.size) > subscription.package.maxFileSize) {
      throw new AppError("File size exceeds limit", 403, "FILE_SIZE_EXCEEDED");
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const newTotalSize = Number(usage.totalSize) + file.size;
    if (BigInt(newTotalSize) > subscription.package.totalFileLimit) {
      throw new AppError(
        "Storage limit exceeded",
        403,
        "STORAGE_LIMIT_EXCEEDED",
      );
    }

    if (folderId) {
      const folder = await this.folderRepository.getFolderById(
        folderId,
        userId,
      );
      if (!folder) {
        throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
      }

      const filesInFolder =
        await this.fileRepository.countFilesInFolder(folderId);
      if (filesInFolder >= subscription.package.filesPerFolder) {
        throw new AppError(
          "Files per folder limit reached",
          403,
          "FILES_PER_FOLDER_LIMIT",
        );
      }
    }

    const allowedTypes = subscription.package.allowedFileTypes;
    if (!allowedTypes.includes("*") && !allowedTypes.includes(file.mimetype)) {
      throw new AppError("File type not allowed", 403, "FILE_TYPE_NOT_ALLOWED");
    }

    let mimeType = file.mimetype;
    if (mimeType === "application/octet-stream") {
      const ext = path.extname(file.originalname).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".mp4": "video/mp4",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".pdf": "application/pdf",
        ".zip": "application/zip",
      };
      mimeType = mimeMap[ext] || mimeType;
    }

    // Save to local storage
    const fileName = `${Date.now()}_${file.originalname}`;
    const userDir = path.join(FILES_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    const filePath = path.join(userDir, fileName);
    await fs.copyFile(file.path, filePath);
    await fs.unlink(file.path);

    const relativePath = `/uploads/files/${userId}/${fileName}`;

    const uploadedFile = await this.fileRepository.createFile({
      name: file.filename,
      originalName: file.originalname,
      mimeType,
      size: BigInt(file.size),
      path: relativePath,
      userId,
      folderId: folderId || null,
    });

    await this.cacheService.del(`subscription:current:${userId}`);
    await this.cacheService.del(`dashboard:stats:${userId}`);

    return {
      file: {
        ...uploadedFile,
        size: uploadedFile.size.toString(),
        url: relativePath,
      },
    };
  }

  // Multi File Upload
  async uploadMultipleFiles(
    userId: string,
    files: Express.Multer.File[],
    folderId?: string,
  ) {
    if (!files || files.length === 0) {
      throw new AppError("No files provided", 400, "NO_FILES");
    }

    const subscription =
      await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError(
        "No active subscription found",
        403,
        "NO_SUBSCRIPTION",
      );
    }

    const uploadedFiles: any[] = [];
    const failedFiles: any[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(userId, file, folderId);
        uploadedFiles.push(result.file);
      } catch (error: any) {
        console.error(`Failed to upload ${file.originalname}:`, error.message);
        failedFiles.push({
          filename: file.originalname,
          error: error.message,
        });
        // Clean up temp file if exists
        if (file.path && fsSync.existsSync(file.path)) {
          fsSync.unlinkSync(file.path);
        }
      }
    }

    return {
      files: uploadedFiles,
      failed: failedFiles,
      success: uploadedFiles.length,
      total: files.length,
    };
  }

  // Initialize Chunked Upload
  async initChunkUpload(userId: string, data: InitChunkUploadInput) {
    const subscription =
      await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError(
        "No active subscription found",
        403,
        "NO_SUBSCRIPTION",
      );
    }

    if (BigInt(data.fileSize) > subscription.package.maxFileSize) {
      throw new AppError("File size exceeds limit", 403, "FILE_SIZE_EXCEEDED");
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const newTotalSize = Number(usage.totalSize) + data.fileSize;
    if (BigInt(newTotalSize) > subscription.package.totalFileLimit) {
      throw new AppError(
        "Storage limit exceeded",
        403,
        "STORAGE_LIMIT_EXCEEDED",
      );
    }

    const uploadId = `upload_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Create chunk directory
    const chunkDir = path.join(CHUNKS_DIR, uploadId);
    await fs.mkdir(chunkDir, { recursive: true });

    // Detect MIME type
    let mimeType = data.mimeType || "application/octet-stream";
    if (mimeType === "application/octet-stream") {
      const ext = path.extname(data.fileName).toLowerCase();
      const mimeMap: Record<string, string> = {
        ".mp4": "video/mp4",
        ".avi": "video/x-msvideo",
        ".mov": "video/quicktime",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".pdf": "application/pdf",
        ".zip": "application/zip",
      };
      mimeType = mimeMap[ext] || mimeType;
    }

    uploadSessions.set(uploadId, {
      uploadId,
      userId,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType,
      totalChunks: data.totalChunks,
      receivedChunks: 0,
      folderId: data.folderId || undefined,
      createdAt: new Date(),
    });

    return { uploadId };
  }

  // Upload Chunk
  async uploadChunk(
    uploadId: string,
    chunkIndex: number,
    chunkFile: Express.Multer.File,
  ) {
    const session = uploadSessions.get(uploadId);
    if (!session) {
      throw new AppError(
        "Upload session not found or expired",
        404,
        "UPLOAD_NOT_FOUND",
      );
    }

    // Save chunk to disk
    const chunkDir = path.join(CHUNKS_DIR, uploadId);
    const chunkPath = path.join(chunkDir, `chunk_${chunkIndex}`);
    await fs.copyFile(chunkFile.path, chunkPath);
    await fs.unlink(chunkFile.path);

    session.receivedChunks += 1;

    return { received: session.receivedChunks, total: session.totalChunks };
  }

  // Complete Chunked Upload
  async completeChunkUpload(userId: string, uploadId: string) {
    const session = uploadSessions.get(uploadId);
    if (!session) {
      throw new AppError(
        "Upload session not found or expired",
        404,
        "UPLOAD_NOT_FOUND",
      );
    }

    if (session.receivedChunks !== session.totalChunks) {
      throw new AppError("Not all chunks received", 400, "INCOMPLETE_UPLOAD");
    }

    // Merge chunks
    const chunkDir = path.join(CHUNKS_DIR, uploadId);
    const fileName = `${Date.now()}_${session.fileName}`;
    const userDir = path.join(FILES_DIR, userId);
    await fs.mkdir(userDir, { recursive: true });
    const finalPath = path.join(userDir, fileName);

    const writeStream = fsSync.createWriteStream(finalPath);

    for (let i = 0; i < session.totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `chunk_${i}`);
      const chunkBuffer = await fs.readFile(chunkPath);
      writeStream.write(chunkBuffer);
    }

    writeStream.end();
    await new Promise((resolve, reject) => {
      writeStream.on("finish", resolve);
      writeStream.on("error", reject);
    });

    // Clean up chunks
    await fs.rm(chunkDir, { recursive: true, force: true });

    const relativePath = `/uploads/files/${userId}/${fileName}`;

    const file = await this.fileRepository.createFile({
      name: fileName,
      originalName: session.fileName,
      mimeType: session.mimeType,
      size: BigInt(session.fileSize),
      path: relativePath,
      userId,
      folderId: session.folderId || null,
    });

    uploadSessions.delete(uploadId);

    await this.cacheService.del(`subscription:current:${userId}`);
    await this.cacheService.del(`dashboard:stats:${userId}`);

    return {
      file: {
        ...file,
        size: file.size.toString(),
        url: relativePath,
      },
    };
  }

  // Generate Upload URL (for direct S3 upload - placeholder)
  async generateUploadUrl(userId: string, _data: UploadUrlInput) {
    const subscription =
      await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError(
        "No active subscription found",
        403,
        "NO_SUBSCRIPTION",
      );
    }

    // This is a placeholder - in production, you'd generate a signed S3 URL
    const fileId = `file_${userId}_${Date.now()}`;
    const uploadUrl = `${process.env.FRONTEND_URL}/upload/${fileId}`;

    return {
      uploadUrl,
      fileId,
    };
  }

  // Cancel Upload
  async cancelUpload(uploadId: string) {
    const session = uploadSessions.get(uploadId);
    if (!session) {
      throw new AppError("Upload session not found", 404, "UPLOAD_NOT_FOUND");
    }

    // Clean up chunks
    const chunkDir = path.join(CHUNKS_DIR, uploadId);
    await fs.rm(chunkDir, { recursive: true, force: true });

    uploadSessions.delete(uploadId);

    return { message: "Upload cancelled successfully" };
  }

  // Get Files
  async getFiles(
    userId: string,
    folderId?: string,
    page: number = 1,
    limit: number = 10,
  ) {
    const { files, total } = await this.fileRepository.getFilesByFolder(
      folderId || null,
      userId,
      page,
      limit,
    );

    return {
      files: files.map((file) => ({
        ...file,
        size: file.size.toString(),
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  // Get File by ID
  async getFileById(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    return {
      file: {
        ...file,
        size: file.size.toString(),
      },
      metadata: {
        createdAt: file.createdAt,
        updatedAt: file.updatedAt,
        mimeType: file.mimeType,
        originalName: file.originalName,
      },
    };
  }

  // Download File
  async getDownloadUrl(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    return { downloadUrl: file.path, fileName: file.originalName };
  }

  // Get Preview URL
  async getPreviewUrl(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    const type = file.mimeType.startsWith("image/")
      ? "image"
      : file.mimeType.startsWith("video/")
        ? "video"
        : file.mimeType === "application/pdf"
          ? "pdf"
          : "other";

    return { previewUrl: file.path, type, mimeType: file.mimeType };
  }

  // Get Thumbnail URL
  async getThumbnailUrl(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    return { thumbnailUrl: file.thumbnailPath || file.path };
  }

  // Rename File
  async renameFile(userId: string, fileId: string, data: RenameFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    const updatedFile = await this.fileRepository.updateFile(fileId, {
      originalName: data.newName,
    });

    return {
      file: {
        ...updatedFile,
        size: updatedFile.size.toString(),
      },
    };
  }

  // Delete File
  async deleteFile(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    // Delete from local storage
    const filePath = path.join(process.cwd(), file.path);
    if (fsSync.existsSync(filePath)) {
      await fs.unlink(filePath);
    }

    await this.fileRepository.softDeleteFile(fileId);

    await this.cacheService.del(`subscription:current:${userId}`);
    await this.cacheService.del(`dashboard:stats:${userId}`);

    return { message: "File moved to trash" };
  }

  // Move File
  async moveFile(userId: string, fileId: string, data: MoveFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    if (data.targetFolderId) {
      const folder = await this.folderRepository.getFolderById(
        data.targetFolderId,
        userId,
      );
      if (!folder) {
        throw new AppError(
          "Target folder not found",
          404,
          "TARGET_FOLDER_NOT_FOUND",
        );
      }

      // Check files per folder limit
      const subscription =
        await this.subscriptionRepository.getCurrentSubscription(userId);
      if (subscription) {
        const filesInFolder = await this.fileRepository.countFilesInFolder(
          data.targetFolderId,
        );
        if (filesInFolder >= subscription.package.filesPerFolder) {
          throw new AppError(
            "Files per folder limit reached",
            403,
            "FILES_PER_FOLDER_LIMIT",
          );
        }
      }
    }

    const movedFile = await this.fileRepository.updateFile(fileId, {
      folderId: data.targetFolderId,
    });

    return {
      file: {
        ...movedFile,
        size: movedFile.size.toString(),
      },
    };
  }

  // Copy File
  async copyFile(userId: string, fileId: string, data: CopyFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    const subscription =
      await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError(
        "No active subscription found",
        403,
        "NO_SUBSCRIPTION",
      );
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const newTotalSize = Number(usage.totalSize) + Number(file.size);
    if (BigInt(newTotalSize) > subscription.package.totalFileLimit) {
      throw new AppError(
        "Storage limit exceeded",
        403,
        "STORAGE_LIMIT_EXCEEDED",
      );
    }

    if (data.targetFolderId) {
      const folder = await this.folderRepository.getFolderById(
        data.targetFolderId,
        userId,
      );
      if (!folder) {
        throw new AppError(
          "Target folder not found",
          404,
          "TARGET_FOLDER_NOT_FOUND",
        );
      }
    }

    // Copy file on disk
    const sourcePath = path.join(process.cwd(), file.path);
    const fileName = `${Date.now()}_copy_${file.originalName}`;
    const userDir = path.join(FILES_DIR, userId);
    const destPath = path.join(userDir, fileName);
    await fs.copyFile(sourcePath, destPath);

    const relativePath = `/uploads/files/${userId}/${fileName}`;

    const copiedFile = await this.fileRepository.createFile({
      name: fileName,
      originalName: `Copy of ${file.originalName}`,
      mimeType: file.mimeType,
      size: file.size,
      path: relativePath,
      userId,
      folderId: data.targetFolderId || null,
    });

    return {
      file: {
        ...copiedFile,
        size: copiedFile.size.toString(),
      },
    };
  }

  // Toggle Favorite
  async toggleFavorite(userId: string, fileId: string, isFavorite: boolean) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    await this.fileRepository.toggleFavorite(fileId, isFavorite);

    return { isFavorite };
  }

  // Share File (placeholder - actual sharing in Phase 6)
  async shareFile(userId: string, fileId: string, _data: ShareFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    // Generate share token
    const shareToken = Math.random().toString(36).substring(2, 15);
    const shareLink = `${process.env.FRONTEND_URL}/share/${shareToken}`;

    // Note: In a real implementation, you'd store this in the database
    // For now, we'll just return the share link
    return { shareLink, token: shareToken };
  }

  // Delete Share
  async deleteShare(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    // In Phase 6, this will delete from database
    return { message: "Share link deleted" };
  }

  // Bulk Delete Files
  async bulkDeleteFiles(userId: string, data: BulkDeleteFilesInput) {
    const files = await this.fileRepository.getFilesByIds(data.fileIds, userId);
    if (files.length === 0) {
      throw new AppError("No files found", 404, "FILES_NOT_FOUND");
    }

    const deletedCount = await this.fileRepository.bulkSoftDelete(data.fileIds);

    // Invalidate cache
    await this.cacheService.del(`subscription:current:${userId}`);
    await this.cacheService.del(`dashboard:stats:${userId}`);

    return {
      message: "Files moved to trash",
      deleted: data.fileIds,
      count: deletedCount,
    };
  }

  // Bulk Move Files
  async bulkMoveFiles(userId: string, data: BulkMoveFilesInput) {
    const files = await this.fileRepository.getFilesByIds(data.fileIds, userId);
    if (files.length === 0) {
      throw new AppError("No files found", 404, "FILES_NOT_FOUND");
    }

    if (data.targetFolderId) {
      const folder = await this.folderRepository.getFolderById(
        data.targetFolderId,
        userId,
      );
      if (!folder) {
        throw new AppError(
          "Target folder not found",
          404,
          "TARGET_FOLDER_NOT_FOUND",
        );
      }
    }

    const movedCount = await this.fileRepository.bulkUpdateFolder(
      data.fileIds,
      data.targetFolderId,
    );

    return {
      message: "Files moved successfully",
      moved: data.fileIds,
      count: movedCount,
    };
  }

  // Bulk Favorite Files
  async bulkFavoriteFiles(userId: string, data: BulkFavoriteFilesInput) {
    const files = await this.fileRepository.getFilesByIds(data.fileIds, userId);
    if (files.length === 0) {
      throw new AppError("No files found", 404, "FILES_NOT_FOUND");
    }

    const count = await this.fileRepository.bulkToggleFavorite(
      data.fileIds,
      true,
    );

    return {
      message: "Files marked as favorite",
      count,
    };
  }
}
