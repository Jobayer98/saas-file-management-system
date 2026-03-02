import { z } from 'zod';

export const selectPackageSchema = z.object({
  packageId: z.number().int().positive('Package ID must be a positive integer'),
});

export const changePackageSchema = z.object({
  newPackageId: z.number().int().positive('Package ID must be a positive integer'),
});

export const paginationQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
});

export type SelectPackageInput = z.infer<typeof selectPackageSchema>;
export type ChangePackageInput = z.infer<typeof changePackageSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
