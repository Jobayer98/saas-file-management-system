import { Router } from 'express';
import { getContainer } from '@/container';
import { authenticate, requireAdmin } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import { cacheMiddleware } from '@/middlewares/cache/cache.middleware';
import { createPackageSchema, updatePackageSchema } from '@/validators/admin/package.validator';
import { updateUserRoleSchema, suspendUserSchema } from '@/validators/admin/user.validator';

const router = Router();

// Apply authentication and admin middleware to all routes
router.use(authenticate);
router.use(requireAdmin);

// Lazy getters for controllers
const getPackageController = () => getContainer().packageController;
const getUserController = () => getContainer().userController;
const getStatsController = () => getContainer().statsController;

// Package Management Routes
router.post('/packages', validate(createPackageSchema), (req, res, next) => getPackageController().createPackage(req, res, next));
router.get('/packages', (req, res, next) => getPackageController().getAllPackages(req, res, next));
router.get('/packages/:id', (req, res, next) => getPackageController().getPackageById(req, res, next));
router.put('/packages/:id', validate(updatePackageSchema), (req, res, next) => getPackageController().updatePackage(req, res, next));
router.delete('/packages/:id', (req, res, next) => getPackageController().deletePackage(req, res, next));
router.patch('/packages/:id/toggle', (req, res, next) => getPackageController().togglePackageStatus(req, res, next));

// User Management Routes
router.get('/users', (req, res, next) => getUserController().getAllUsers(req, res, next));
router.get('/users/:id', (req, res, next) => getUserController().getUserById(req, res, next));
router.put('/users/:id/role', validate(updateUserRoleSchema), (req, res, next) => getUserController().updateUserRole(req, res, next));
router.post('/users/:id/suspend', validate(suspendUserSchema), (req, res, next) => getUserController().suspendUser(req, res, next));
router.post('/users/:id/activate', (req, res, next) => getUserController().activateUser(req, res, next));

// Stats Routes
router.get('/stats/overview', cacheMiddleware(600), (req, res, next) => getStatsController().getOverviewStats(req, res, next));
router.get('/stats/revenue', cacheMiddleware(1800), (req, res, next) => getStatsController().getRevenueStats(req, res, next));
router.get('/stats/usage', cacheMiddleware(600), (req, res, next) => getStatsController().getUsageStats(req, res, next));

export default router;
