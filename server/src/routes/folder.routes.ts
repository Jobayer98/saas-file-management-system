import { Router } from 'express';
import folderController from '@/controllers/folder/folder.controller';
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

// Folder Routes
router.post('/', validate(createFolderSchema), folderController.createFolder);
router.get('/', folderController.getFolders);
router.get('/tree', folderController.getFolderTree);
router.get('/:id', folderController.getFolderById);
router.get('/:id/children', folderController.getChildrenFolders);
router.get('/:id/breadcrumb', folderController.getBreadcrumb);
router.put('/:id', validate(updateFolderSchema), folderController.updateFolder);
router.delete('/:id', folderController.deleteFolder);
router.post('/:id/move', validate(moveFolderSchema), folderController.moveFolder);
router.post('/:id/copy', validate(copyFolderSchema), folderController.copyFolder);

// Bulk Operations
router.post('/bulk/create', validate(bulkCreateFoldersSchema), folderController.bulkCreateFolders);
router.post('/bulk/delete', validate(bulkDeleteFoldersSchema), folderController.bulkDeleteFolders);
router.post('/bulk/move', validate(bulkMoveFoldersSchema), folderController.bulkMoveFolders);

export default router;
