import { Router } from 'express';
import { getContainer } from '../container';
import { authenticate } from '../middlewares/auth/auth.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Lazy getter for controller
const getController = () => getContainer().trashController;

// Trash Routes
router.get('/', (req, res, next) => getController().getTrashItems(req, res, next));
router.post('/files/:id/restore', (req, res, next) => getController().restoreFile(req, res, next));
router.post('/folders/:id/restore', (req, res, next) => getController().restoreFolder(req, res, next));
router.delete('/files/:id', (req, res, next) => getController().permanentlyDeleteFile(req, res, next));
router.delete('/folders/:id', (req, res, next) => getController().permanentlyDeleteFolder(req, res, next));
router.delete('/empty', (req, res, next) => getController().emptyTrash(req, res, next));

export default router;
