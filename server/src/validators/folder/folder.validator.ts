import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name too long'),
  parentId: z.string().uuid('Invalid parent folder ID').optional().nullable(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(255, 'Folder name too long'),
});

export const moveFolderSchema = z.object({
  targetFolderId: z.string().uuid('Invalid target folder ID').nullable(),
});

export const copyFolderSchema = z.object({
  targetFolderId: z.string().uuid('Invalid target folder ID').nullable(),
});

export const bulkCreateFoldersSchema = z.object({
  names: z.array(z.string().min(1, 'Folder name is required')).min(1, 'At least one folder name is required'),
  parentId: z.string().uuid('Invalid parent folder ID').optional().nullable(),
});

export const bulkDeleteFoldersSchema = z.object({
  folderIds: z.array(z.string().uuid('Invalid folder ID')).min(1, 'At least one folder ID is required'),
});

export const bulkMoveFoldersSchema = z.object({
  folderIds: z.array(z.string().uuid('Invalid folder ID')).min(1, 'At least one folder ID is required'),
  targetFolderId: z.string().uuid('Invalid target folder ID').nullable(),
});

export type CreateFolderInput = z.infer<typeof createFolderSchema>;
export type UpdateFolderInput = z.infer<typeof updateFolderSchema>;
export type MoveFolderInput = z.infer<typeof moveFolderSchema>;
export type CopyFolderInput = z.infer<typeof copyFolderSchema>;
export type BulkCreateFoldersInput = z.infer<typeof bulkCreateFoldersSchema>;
export type BulkDeleteFoldersInput = z.infer<typeof bulkDeleteFoldersSchema>;
export type BulkMoveFoldersInput = z.infer<typeof bulkMoveFoldersSchema>;
