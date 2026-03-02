import { z } from 'zod';

export const updateUserRoleSchema = z.object({
  isAdmin: z.boolean(),
});

export const suspendUserSchema = z.object({
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
});

export const getUsersQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val) : 10),
  search: z.string().optional(),
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;
export type SuspendUserInput = z.infer<typeof suspendUserSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
