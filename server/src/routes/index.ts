import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import subscriptionRoutes from './subscription.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/subscriptions', subscriptionRoutes);

export default router;
