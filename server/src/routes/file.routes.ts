import { Router } from 'express';
import fileController from '@/controllers/file/file.controller';
import { authenticate } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import { uploadSingle, uploadMultiple, uploadChunk } from '@/middlewares/upload/upload.middleware';
import {
  initChunkUploadSchema,
  uploadUrlSchema,
  cancelUploadSchema,
  renameFileSchema,
  moveFileSchema,
  copyFileSchema,
  shareFileSchema,
  bulkDeleteFilesSchema,
  bulkMoveFilesSchema,
  bulkFavoriteFilesSchema,
} from '@/validators/file/file.validator';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// File Upload Routes
router.post('/upload', uploadSingle, fileController.uploadFile);
router.post('/multi-upload', uploadMultiple, fileController.uploadMultipleFiles);
router.post('/upload/chunk/init', validate(initChunkUploadSchema), fileController.initChunkUpload);
router.post('/upload/chunk', uploadChunk, fileController.uploadChunk);
router.post('/upload/chunk/complete', fileController.completeChunkUpload);
router.post('/upload/url', validate(uploadUrlSchema), fileController.generateUploadUrl);
router.post('/upload/cancel', validate(cancelUploadSchema), fileController.cancelUpload);

// File Management Routes
router.get('/', fileController.getFiles);
router.get('/:id', fileController.getFileById);
router.get('/:id/download', fileController.downloadFile);
router.get('/:id/preview', fileController.getPreview);
router.get('/:id/thumbnail', fileController.getThumbnail);
router.put('/:id/rename', validate(renameFileSchema), fileController.renameFile);
router.delete('/:id', fileController.deleteFile);
router.post('/:id/move', validate(moveFileSchema), fileController.moveFile);
router.post('/:id/copy', validate(copyFileSchema), fileController.copyFile);
router.post('/:id/favorite', fileController.favoriteFile);
router.post('/:id/unfavorite', fileController.unfavoriteFile);
router.post('/:id/share', validate(shareFileSchema), fileController.shareFile);
router.delete('/:id/share', fileController.deleteShare);

// Bulk Operations
router.post('/bulk/delete', validate(bulkDeleteFilesSchema), fileController.bulkDeleteFiles);
router.post('/bulk/move', validate(bulkMoveFilesSchema), fileController.bulkMoveFiles);
router.post('/bulk/favorite', validate(bulkFavoriteFilesSchema), fileController.bulkFavoriteFiles);

// File Version Routes
router.get('/:id/versions', fileController.getFileVersions);
router.post('/:id/versions', uploadSingle, fileController.createFileVersion);
router.post('/:id/versions/:versionId/restore', fileController.restoreFileVersion);
router.delete('/:id/versions/:versionId', fileController.deleteFileVersion);
router.get('/:id/versions/:versionId/download', fileController.downloadFileVersion);

export default router;
