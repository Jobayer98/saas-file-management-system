import { Router } from 'express';
import { authenticate } from '@/middlewares/auth/auth.middleware';
import { cacheMiddleware } from '@/middlewares/cache/cache.middleware';
import { getContainer } from '@/container';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

const getController = () => getContainer().dashboardController;

// Dashboard stats endpoint
router.get('/stats', cacheMiddleware(300), (req, res, next) => getController().getDashboardStats(req, res, next));

export default router;