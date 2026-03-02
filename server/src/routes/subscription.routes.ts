import { Router } from 'express';
import subscriptionController from '@/controllers/subscription/subscription.controller';
import { authenticate } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import {
  selectPackageSchema,
  changePackageSchema,
} from '@/validators/subscription/subscription.validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Subscription Routes
router.get('/packages', subscriptionController.getActivePackages);
router.get('/current', subscriptionController.getCurrentSubscription);
router.post('/select', validate(selectPackageSchema), subscriptionController.selectPackage);
router.put('/change', validate(changePackageSchema), subscriptionController.changePackage);
router.get('/history', subscriptionController.getSubscriptionHistory);
router.get('/usage', subscriptionController.getUsageStats);
router.get('/limits', subscriptionController.getLimits);
router.post('/cancel', subscriptionController.cancelSubscription);
router.post('/renew', subscriptionController.renewSubscription);

export default router;
