import { Router } from 'express';
import { getContainer } from '@/container';
import { authenticate } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import { cacheMiddleware } from '@/middlewares/cache/cache.middleware';
import {
  selectPackageSchema,
  changePackageSchema,
} from '@/validators/subscription/subscription.validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Lazy getter for controller
const getController = () => getContainer().subscriptionController;

// Subscription Routes
router.get('/packages', cacheMiddleware(1800), (req, res, next) => getController().getActivePackages(req, res, next));
router.get('/current', cacheMiddleware(300), (req, res, next) => getController().getCurrentSubscription(req, res, next));
router.post('/select', validate(selectPackageSchema), (req, res, next) => getController().selectPackage(req, res, next));
router.put('/change', validate(changePackageSchema), (req, res, next) => getController().changePackage(req, res, next));
router.get('/history', (req, res, next) => getController().getSubscriptionHistory(req, res, next));
router.get('/usage', (req, res, next) => getController().getUsageStats(req, res, next));
router.get('/limits', (req, res, next) => getController().getLimits(req, res, next));
router.post('/cancel', (req, res, next) => getController().cancelSubscription(req, res, next));
router.post('/renew', (req, res, next) => getController().renewSubscription(req, res, next));

export default router;
