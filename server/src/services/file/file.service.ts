import { AppError } from '@/middlewares/error/error.middleware';
import path from 'path';
import fs from 'fs';
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
} from '@/validators/file/file.validator';
import { SubscriptionRepository } from '@/repositories/subscription/subscription.repository';
import { FolderRepository } from '@/repositories/folder/folder.repository';
import { FileRepository } from '@/repositories/file/file.repository';

// In-memory store for upload sessions
interface UploadSession {
  uploadId: string;
  userId: string;
  fileName: string;
  totalChunks: number;
  receivedChunks: number;
  folderId?: string;
  createdAt: Date;
}

const uploadSessions = new Map<string, UploadSession>();

// Clean up expired sessions every 30 minutes
setInterval(() => {
  const now = new Date();
  for (const [uploadId, session] of uploadSessions.entries()) {
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000); // 1 hour ago
    if (session.createdAt < hourAgo) {
      uploadSessions.delete(uploadId);
    }
  }
}, 30 * 60 * 1000);

export class FileService {
  constructor(private fileRepository: FileRepository, private subscriptionRepository: SubscriptionRepository, private folderRepository: FolderRepository) { }

  // Single File Upload
  async uploadFile(userId: string, file: Express.Multer.File, folderId?: string) {
    // Check subscription limits
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    // Check file size limit
    if (BigInt(file.size) > subscription.package.maxFileSize) {
      throw new AppError('File size exceeds limit', 403, 'FILE_SIZE_EXCEEDED');
    }

    // Check total storage limit
    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const newTotalSize = Number(usage.totalSize) + file.size;
    if (BigInt(newTotalSize) > subscription.package.totalFileLimit) {
      throw new AppError('Storage limit exceeded', 403, 'STORAGE_LIMIT_EXCEEDED');
    }

    // Check folder exists and files per folder limit
    if (folderId) {
      const folder = await this.folderRepository.getFolderById(folderId, userId);
      if (!folder) {
        throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
      }

      const filesInFolder = await this.fileRepository.countFilesInFolder(folderId);
      if (filesInFolder >= subscription.package.filesPerFolder) {
        throw new AppError('Files per folder limit reached', 403, 'FILES_PER_FOLDER_LIMIT');
      }
    }

    // Check file type
    const allowedTypes = subscription.package.allowedFileTypes;
    if (!allowedTypes.includes('*') && !allowedTypes.includes(file.mimetype)) {
      throw new AppError('File type not allowed', 403, 'FILE_TYPE_NOT_ALLOWED');
    }

    // Create file record
    const uploadedFile = await this.fileRepository.createFile({
      name: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: BigInt(file.size),
      path: file.path,
      userId,
      folderId: folderId || null,
    });

    return {
      file: {
        ...uploadedFile,
        size: uploadedFile.size.toString(),
      },
    };
  }

  // Multi File Upload
  async uploadMultipleFiles(userId: string, files: Express.Multer.File[], folderId?: string) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    const uploadedFiles: any[] = [];
    const failedFiles: any[] = [];

    for (const file of files) {
      try {
        const result = await this.uploadFile(userId, file, folderId);
        uploadedFiles.push(result.file);
      } catch (error: any) {
        failedFiles.push({
          filename: file.originalname,
          error: error.message,
        });
      }
    }

    return {
      files: uploadedFiles,
      failed: failedFiles,
    };
  }

  // Initialize Chunked Upload
  async initChunkUpload(userId: string, data: InitChunkUploadInput) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    // Check file size limit
    if (BigInt(data.fileSize) > subscription.package.maxFileSize) {
      throw new AppError('File size exceeds limit', 403, 'FILE_SIZE_EXCEEDED');
    }

    // Check storage limit
    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const newTotalSize = Number(usage.totalSize) + data.fileSize;
    if (BigInt(newTotalSize) > subscription.package.totalFileLimit) {
      throw new AppError('Storage limit exceeded', 403, 'STORAGE_LIMIT_EXCEEDED');
    }

    // Generate upload ID
    const uploadId = `upload_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Store upload metadata in memory
    uploadSessions.set(uploadId, {
      uploadId,
      userId,
      fileName: data.fileName,
      totalChunks: data.totalChunks,
      receivedChunks: 0,
      folderId: data.folderId || undefined,
      createdAt: new Date(),
    });

    return { uploadId };
  }

  // Upload Chunk
  async uploadChunk(uploadId: string, _chunkIndex: number, _chunkFile: Express.Multer.File) {
    const session = uploadSessions.get(uploadId);
    if (!session) {
      throw new AppError('Upload session not found or expired', 404, 'UPLOAD_NOT_FOUND');
    }

    session.receivedChunks += 1;

    return { received: session.receivedChunks, total: session.totalChunks };
  }

  // Complete Chunked Upload
  async completeChunkUpload(userId: string, uploadId: string) {
    const session = uploadSessions.get(uploadId);
    if (!session) {
      throw new AppError('Upload session not found or expired', 404, 'UPLOAD_NOT_FOUND');
    }

    if (session.receivedChunks !== session.totalChunks) {
      throw new AppError('Not all chunks received', 400, 'INCOMPLETE_UPLOAD');
    }

    // For simplicity, we'll create a placeholder file record
    // In a real implementation, you'd merge the actual chunk files
    const file = await this.fileRepository.createFile({
      name: session.fileName,
      originalName: session.fileName,
      mimeType: 'application/octet-stream', // Default mime type
      size: BigInt(0), // Placeholder size
      path: `/uploads/${session.fileName}`,
      userId,
      folderId: session.folderId || null,
    });

    // Clean up session
    uploadSessions.delete(uploadId);

    return {
      file: {
        ...file,
        size: file.size.toString(),
      },
    };
  }

  // Generate Upload URL (for direct S3 upload - placeholder)
  async generateUploadUrl(userId: string, _data: UploadUrlInput) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
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
      throw new AppError('Upload session not found', 404, 'UPLOAD_NOT_FOUND');
    }

    // Clean up session
    uploadSessions.delete(uploadId);

    return { message: 'Upload cancelled successfully' };
  }

  // Get Files
  async getFiles(userId: string, folderId?: string, page: number = 1, limit: number = 10) {
    const { files, total } = await this.fileRepository.getFilesByFolder(
      folderId || null,
      userId,
      page,
      limit
    );

    return {
      files: files.map(file => ({
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
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
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
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    // In production, generate signed URL for S3
    const downloadUrl = `/files/download/${fileId}`;

    return { downloadUrl, file: file.path };
  }

  // Get Preview URL
  async getPreviewUrl(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const previewUrl = `/files/preview/${fileId}`;
    const type = file.mimeType.startsWith('image/') ? 'image' :
      file.mimeType.startsWith('video/') ? 'video' :
        file.mimeType === 'application/pdf' ? 'pdf' : 'other';

    return { previewUrl, type };
  }

  // Get Thumbnail URL
  async getThumbnailUrl(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const thumbnailUrl = file.thumbnailPath || `/files/thumbnail/${fileId}`;

    return { thumbnailUrl };
  }

  // Rename File
  async renameFile(userId: string, fileId: string, data: RenameFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
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
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    await this.fileRepository.softDeleteFile(fileId);

    return { message: 'File moved to trash' };
  }

  // Move File
  async moveFile(userId: string, fileId: string, data: MoveFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    if (data.targetFolderId) {
      const folder = await this.folderRepository.getFolderById(data.targetFolderId, userId);
      if (!folder) {
        throw new AppError('Target folder not found', 404, 'TARGET_FOLDER_NOT_FOUND');
      }

      // Check files per folder limit
      const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
      if (subscription) {
        const filesInFolder = await this.fileRepository.countFilesInFolder(data.targetFolderId);
        if (filesInFolder >= subscription.package.filesPerFolder) {
          throw new AppError('Files per folder limit reached', 403, 'FILES_PER_FOLDER_LIMIT');
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
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    // Check subscription limits
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const newTotalSize = Number(usage.totalSize) + Number(file.size);
    if (BigInt(newTotalSize) > subscription.package.totalFileLimit) {
      throw new AppError('Storage limit exceeded', 403, 'STORAGE_LIMIT_EXCEEDED');
    }

    if (data.targetFolderId) {
      const folder = await this.folderRepository.getFolderById(data.targetFolderId, userId);
      if (!folder) {
        throw new AppError('Target folder not found', 404, 'TARGET_FOLDER_NOT_FOUND');
      }
    }

    // Copy file on disk
    const copyPath = file.path.replace(path.basename(file.path), `copy_${path.basename(file.path)}`);
    fs.copyFileSync(file.path, copyPath);

    // Create new file record
    const copiedFile = await this.fileRepository.createFile({
      name: `copy_${file.name}`,
      originalName: `Copy of ${file.originalName}`,
      mimeType: file.mimeType,
      size: file.size,
      path: copyPath,
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
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    await this.fileRepository.toggleFavorite(fileId, isFavorite);

    return { isFavorite };
  }

  // Share File (placeholder - actual sharing in Phase 6)
  async shareFile(userId: string, fileId: string, _data: ShareFileInput) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
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
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    // In Phase 6, this will delete from database
    return { message: 'Share link deleted' };
  }

  // Bulk Delete Files
  async bulkDeleteFiles(userId: string, data: BulkDeleteFilesInput) {
    const files = await this.fileRepository.getFilesByIds(data.fileIds, userId);
    if (files.length === 0) {
      throw new AppError('No files found', 404, 'FILES_NOT_FOUND');
    }

    const deletedCount = await this.fileRepository.bulkSoftDelete(data.fileIds);

    return {
      message: 'Files moved to trash',
      deleted: data.fileIds,
      count: deletedCount,
    };
  }

  // Bulk Move Files
  async bulkMoveFiles(userId: string, data: BulkMoveFilesInput) {
    const files = await this.fileRepository.getFilesByIds(data.fileIds, userId);
    if (files.length === 0) {
      throw new AppError('No files found', 404, 'FILES_NOT_FOUND');
    }

    if (data.targetFolderId) {
      const folder = await this.folderRepository.getFolderById(data.targetFolderId, userId);
      if (!folder) {
        throw new AppError('Target folder not found', 404, 'TARGET_FOLDER_NOT_FOUND');
      }
    }

    const movedCount = await this.fileRepository.bulkUpdateFolder(data.fileIds, data.targetFolderId);

    return {
      message: 'Files moved successfully',
      moved: data.fileIds,
      count: movedCount,
    };
  }

  // Bulk Favorite Files
  async bulkFavoriteFiles(userId: string, data: BulkFavoriteFilesInput) {
    const files = await this.fileRepository.getFilesByIds(data.fileIds, userId);
    if (files.length === 0) {
      throw new AppError('No files found', 404, 'FILES_NOT_FOUND');
    }

    const count = await this.fileRepository.bulkToggleFavorite(data.fileIds, true);

    return {
      message: 'Files marked as favorite',
      count,
    };
  }

  // File Versions
  async getFileVersions(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const versions = await this.fileRepository.getFileVersions(fileId);

    return {
      versions: versions.map(v => ({
        ...v,
        size: v.size.toString(),
      })),
    };
  }

  async createFileVersion(userId: string, fileId: string, newFile: Express.Multer.File) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const latestVersion = await this.fileRepository.getLatestVersionNumber(fileId);
    const newVersion = latestVersion + 1;

    const version = await this.fileRepository.createFileVersion({
      fileId,
      version: newVersion,
      path: newFile.path,
      size: BigInt(newFile.size),
    });

    return {
      version: {
        ...version,
        size: version.size.toString(),
      },
    };
  }

  async restoreFileVersion(userId: string, fileId: string, versionId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const version = await this.fileRepository.getFileVersionById(versionId);
    if (!version || version.fileId !== fileId) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    // Copy version file to current file
    fs.copyFileSync(version.path, file.path);

    await this.fileRepository.updateFile(fileId, {
      size: version.size,
      updatedAt: new Date(),
    });

    return {
      file: {
        ...file,
        size: version.size.toString(),
      },
    };
  }

  async deleteFileVersion(userId: string, fileId: string, versionId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const version = await this.fileRepository.getFileVersionById(versionId);
    if (!version || version.fileId !== fileId) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    // Delete file from disk
    if (fs.existsSync(version.path)) {
      fs.unlinkSync(version.path);
    }

    await this.fileRepository.deleteFileVersion(versionId);

    return { message: 'Version deleted successfully' };
  }

  async getVersionDownloadUrl(userId: string, fileId: string, versionId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId);
    if (!file) {
      throw new AppError('File not found', 404, 'FILE_NOT_FOUND');
    }

    const version = await this.fileRepository.getFileVersionById(versionId);
    if (!version || version.fileId !== fileId) {
      throw new AppError('Version not found', 404, 'VERSION_NOT_FOUND');
    }

    const downloadUrl = `/files/versions/${versionId}/download`;

    return { downloadUrl, file: version.path };
  }
}
