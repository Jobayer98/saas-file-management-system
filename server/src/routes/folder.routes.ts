import { Router } from 'express';
import { getContainer } from '@/container';
import { authenticate } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import {
  createFolderSchema,
  updateFolderSchema,
  moveFolderSchema,
  copyFolderSchema,
  bulkCreateFoldersSchema,
  bulkDeleteFoldersSchema,
  bulkMoveFoldersSchema,
} from '@/validators/folder/folder.validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Lazy getter for controller
const getController = () => getContainer().folderController;

// Folder Routes
router.post('/', validate(createFolderSchema), (req, res, next) => getController().createFolder(req, res, next));
router.get('/', (req, res, next) => getController().getFolders(req, res, next));
router.get('/tree', (req, res, next) => getController().getFolderTree(req, res, next));
router.get('/:id', (req, res, next) => getController().getFolderById(req, res, next));
router.get('/:id/children', (req, res, next) => getController().getChildrenFolders(req, res, next));
router.get('/:id/breadcrumb', (req, res, next) => getController().getBreadcrumb(req, res, next));
router.put('/:id', validate(updateFolderSchema), (req, res, next) => getController().updateFolder(req, res, next));
router.delete('/:id', (req, res, next) => getController().deleteFolder(req, res, next));
router.post('/:id/move', validate(moveFolderSchema), (req, res, next) => getController().moveFolder(req, res, next));
router.post('/:id/copy', validate(copyFolderSchema), (req, res, next) => getController().copyFolder(req, res, next));

// Bulk Operations
router.post('/bulk/create', validate(bulkCreateFoldersSchema), (req, res, next) => getController().bulkCreateFolders(req, res, next));
router.post('/bulk/delete', validate(bulkDeleteFoldersSchema), (req, res, next) => getController().bulkDeleteFolders(req, res, next));
router.post('/bulk/move', validate(bulkMoveFoldersSchema), (req, res, next) => getController().bulkMoveFolders(req, res, next));

export default router;
