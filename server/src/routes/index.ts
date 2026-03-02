import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';
import subscriptionRoutes from './subscription.routes';
import folderRoutes from './folder.routes';
import fileRoutes from './file.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/folders', folderRoutes);
router.use('/files', fileRoutes);

export default router;
