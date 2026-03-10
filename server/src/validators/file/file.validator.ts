import { z } from 'zod';

// File Upload Validators
export const initChunkUploadSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  fileSize: z.number().positive('File size must be positive'),
  folderId: z.uuid('Invalid folder ID').optional().nullable(),
  mimeType: z.string().optional(),
  totalChunks: z.number().int().positive('Total chunks must be positive'),
});

export const uploadUrlSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  folderId: z.uuid('Invalid folder ID').optional().nullable(),
  mimeType: z.string().optional(),
});

export const cancelUploadSchema = z.object({
  uploadId: z.string().min(1, 'Upload ID is required'),
});

// File Management Validators
export const renameFileSchema = z.object({
  newName: z.string().min(1, 'New name is required').max(255, 'Name too long'),
});

export const moveFileSchema = z.object({
  targetFolderId: z.uuid('Invalid target folder ID').nullable(),
});

export const copyFileSchema = z.object({
  targetFolderId: z.uuid('Invalid target folder ID').nullable(),
});

export const shareFileSchema = z.object({
  expiresIn: z.number().int().positive('Expires in must be positive').optional(),
  permissions: z.enum(['view', 'download', 'edit']).default('view'),
});

export const bulkDeleteFilesSchema = z.object({
  fileIds: z.array(z.uuid('Invalid file ID')).min(1, 'At least one file ID is required'),
});

export const bulkMoveFilesSchema = z.object({
  fileIds: z.array(z.uuid('Invalid file ID')).min(1, 'At least one file ID is required'),
  targetFolderId: z.uuid('Invalid target folder ID').nullable(),
});

export const bulkFavoriteFilesSchema = z.object({
  fileIds: z.array(z.uuid('Invalid file ID')).min(1, 'At least one file ID is required'),
});

export type InitChunkUploadInput = z.infer<typeof initChunkUploadSchema>;
export type UploadUrlInput = z.infer<typeof uploadUrlSchema>;
export type CancelUploadInput = z.infer<typeof cancelUploadSchema>;
export type RenameFileInput = z.infer<typeof renameFileSchema>;
export type MoveFileInput = z.infer<typeof moveFileSchema>;
export type CopyFileInput = z.infer<typeof copyFileSchema>;
export type ShareFileInput = z.infer<typeof shareFileSchema>;
export type BulkDeleteFilesInput = z.infer<typeof bulkDeleteFilesSchema>;
export type BulkMoveFilesInput = z.infer<typeof bulkMoveFilesSchema>;
export type BulkFavoriteFilesInput = z.infer<typeof bulkFavoriteFilesSchema>;
