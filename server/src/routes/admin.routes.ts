import packageController from '@/controllers/admin/package.controller';
import statsController from '@/controllers/admin/stats.controller';
import userController from '@/controllers/admin/user.controller';
import { authenticate, requireAdmin } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import { createPackageSchema, updatePackageSchema } from '@/validators/admin/package.validator';
import { updateUserRoleSchema, suspendUserSchema } from '@/validators/admin/user.validator';
import { Router } from 'express';


const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// Package Management Routes
router.post('/packages', validate(createPackageSchema), packageController.createPackage);
router.get('/packages', packageController.getAllPackages);
router.get('/packages/:id', packageController.getPackageById);
router.put('/packages/:id', validate(updatePackageSchema), packageController.updatePackage);
router.delete('/packages/:id', packageController.deletePackage);
router.patch('/packages/:id/toggle', packageController.togglePackageStatus);

// User Management Routes
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id/role', validate(updateUserRoleSchema), userController.updateUserRole);
router.post('/users/:id/suspend', validate(suspendUserSchema), userController.suspendUser);
router.post('/users/:id/activate', userController.activateUser);

// Stats Routes
router.get('/stats/overview', statsController.getOverviewStats);
router.get('/stats/revenue', statsController.getRevenueStats);
router.get('/stats/usage', statsController.getUsageStats);

export default router;
