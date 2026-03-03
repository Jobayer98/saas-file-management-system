import { Router } from 'express';
import { getContainer } from '@/container';
import { authenticate } from '@/middlewares/auth/auth.middleware';
import { validate } from '@/middlewares/validation/validate.middleware';
import { uploadSingle, uploadMultiple, uploadChunk } from '@/middlewares/upload/upload.middleware';
import {
  uploadRateLimit,
  creationRateLimit,
  bulkOperationRateLimit,
  uploadConcurrencyLimit,
  bulkOperationConcurrencyLimit,
  subscriptionAwareUploadLimit,
} from '@/middlewares/rateLimiter';
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

// Lazy getter for controller
const getController = () => getContainer().fileController;

// File Upload Routes (with rate limiting and concurrency control)
router.post('/upload',
  subscriptionAwareUploadLimit,
  uploadConcurrencyLimit,
  uploadSingle,
  (req, res, next) => getController().uploadFile(req, res, next)
);

router.post('/multi-upload',
  uploadRateLimit,
  uploadConcurrencyLimit,
  uploadMultiple,
  (req, res, next) => getController().uploadMultipleFiles(req, res, next)
);

router.post('/upload/chunk/init',
  uploadRateLimit,
  validate(initChunkUploadSchema),
  (req, res, next) => getController().initChunkUpload(req, res, next)
);

router.post('/upload/chunk',
  uploadConcurrencyLimit,
  uploadChunk,
  (req, res, next) => getController().uploadChunk(req, res, next)
);

router.post('/upload/chunk/complete',
  (req, res, next) => getController().completeChunkUpload(req, res, next)
);

router.post('/upload/url',
  uploadRateLimit,
  validate(uploadUrlSchema),
  (req, res, next) => getController().generateUploadUrl(req, res, next)
);

router.post('/upload/cancel',
  validate(cancelUploadSchema),
  (req, res, next) => getController().cancelUpload(req, res, next)
);

// File Management Routes
router.get('/', (req, res, next) => getController().getFiles(req, res, next));
router.get('/:id', (req, res, next) => getController().getFileById(req, res, next));
router.get('/:id/download', (req, res, next) => getController().downloadFile(req, res, next));
router.get('/:id/preview', (req, res, next) => getController().getPreview(req, res, next));
router.get('/:id/thumbnail', (req, res, next) => getController().getThumbnail(req, res, next));

router.put('/:id/rename',
  creationRateLimit,
  validate(renameFileSchema),
  (req, res, next) => getController().renameFile(req, res, next)
);

router.delete('/:id', (req, res, next) => getController().deleteFile(req, res, next));

router.post('/:id/move',
  creationRateLimit,
  validate(moveFileSchema),
  (req, res, next) => getController().moveFile(req, res, next)
);

router.post('/:id/copy',
  creationRateLimit,
  validate(copyFileSchema),
  (req, res, next) => getController().copyFile(req, res, next)
);

router.post('/:id/favorite', (req, res, next) => getController().favoriteFile(req, res, next));
router.post('/:id/unfavorite', (req, res, next) => getController().unfavoriteFile(req, res, next));

router.post('/:id/share',
  creationRateLimit,
  validate(shareFileSchema),
  (req, res, next) => getController().shareFile(req, res, next)
);

router.delete('/:id/share', (req, res, next) => getController().deleteShare(req, res, next));

// Bulk Operations (with strict rate limiting)
router.post('/bulk/delete',
  bulkOperationRateLimit,
  bulkOperationConcurrencyLimit,
  validate(bulkDeleteFilesSchema),
  (req, res, next) => getController().bulkDeleteFiles(req, res, next)
);

router.post('/bulk/move',
  bulkOperationRateLimit,
  bulkOperationConcurrencyLimit,
  validate(bulkMoveFilesSchema),
  (req, res, next) => getController().bulkMoveFiles(req, res, next)
);

router.post('/bulk/favorite',
  bulkOperationRateLimit,
  validate(bulkFavoriteFilesSchema),
  (req, res, next) => getController().bulkFavoriteFiles(req, res, next)
);

// File Version Routes
router.get('/:id/versions', (req, res, next) => getController().getFileVersions(req, res, next));

router.post('/:id/versions',
  uploadRateLimit,
  uploadSingle,
  (req, res, next) => getController().createFileVersion(req, res, next)
);

router.post('/:id/versions/:versionId/restore',
  creationRateLimit,
  (req, res, next) => getController().restoreFileVersion(req, res, next)
);

router.delete('/:id/versions/:versionId',
  (req, res, next) => getController().deleteFileVersion(req, res, next)
);

router.get('/:id/versions/:versionId/download',
  (req, res, next) => getController().downloadFileVersion(req, res, next)
);

export default router;
