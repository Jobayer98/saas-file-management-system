import { z } from 'zod';

export const createPackageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  maxFolders: z.number().int().positive('Max folders must be positive'),
  maxNestingLevel: z.number().int().positive('Max nesting level must be positive'),
  allowedFileTypes: z.array(z.string()).min(1, 'At least one file type is required'),
  maxFileSize: z.number().positive('Max file size must be positive'),
  totalFileLimit: z.number().positive('Total file limit must be positive'),
  filesPerFolder: z.number().int().positive('Files per folder must be positive'),
  price: z.number().nonnegative('Price must be non-negative'),
});

export const updatePackageSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').optional(),
  maxFolders: z.number().int().positive('Max folders must be positive').optional(),
  maxNestingLevel: z.number().int().positive('Max nesting level must be positive').optional(),
  allowedFileTypes: z.array(z.string()).min(1, 'At least one file type is required').optional(),
  maxFileSize: z.number().positive('Max file size must be positive').optional(),
  totalFileLimit: z.number().positive('Total file limit must be positive').optional(),
  filesPerFolder: z.number().int().positive('Files per folder must be positive').optional(),
  price: z.number().nonnegative('Price must be non-negative').optional(),
  isActive: z.boolean().optional(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
