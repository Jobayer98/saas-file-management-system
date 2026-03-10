import { Response } from "express";
import { FileService } from "@/services/file/file.service";
import { AuthRequest } from "@/types";
import { asyncHandler } from "@/utils/asyncHandler";
import { ResponseUtil } from "@/utils/response";

export class FileController {
  constructor(private fileService: FileService) {}

  // Upload Operations
  uploadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new Error("No file uploaded");
    }
    const result = await this.fileService.uploadFile(
      req.user!.id,
      req.file,
      req.body.folderId,
    );
    ResponseUtil.success(res, result.file, "File uploaded successfully", 201);
  });

  uploadMultipleFiles = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      if (!req.files || !Array.isArray(req.files)) {
        throw new Error("No files uploaded");
      }
      const result = await this.fileService.uploadMultipleFiles(
        req.user!.id,
        req.files,
        req.body.folderId,
      );
      ResponseUtil.success(res, result, "Files uploaded successfully", 201);
    },
  );

  initChunkUpload = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.initChunkUpload(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(res, result, "Chunk upload initialized", 201);
  });

  uploadChunk = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new Error("No chunk uploaded");
    }
    const { uploadId, chunkIndex } = req.body;
    const result = await this.fileService.uploadChunk(
      uploadId,
      parseInt(chunkIndex),
      req.file,
    );
    ResponseUtil.success(res, result, "Chunk uploaded successfully");
  });

  completeChunkUpload = asyncHandler(
    async (req: AuthRequest, res: Response) => {
      const result = await this.fileService.completeChunkUpload(
        req.user!.id,
        req.body.uploadId,
      );
      ResponseUtil.success(res, result.file, "File upload completed", 201);
    },
  );

  generateUploadUrl = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.generateUploadUrl(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(res, result, "Upload URL generated");
  });

  cancelUpload = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.cancelUpload(req.body.uploadId);
    ResponseUtil.success(res, null, result.message);
  });

  // File Management
  getFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const folderId = req.query.folderId as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.fileService.getFiles(
      req.user!.id,
      folderId,
      page,
      limit,
    );
    ResponseUtil.success(res, result, "Files retrieved successfully");
  });

  getFileById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.getFileById(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(res, result, "File retrieved successfully");
  });

  downloadFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.getDownloadUrl(
      req.user!.id,
      req.params.id as string,
    );

    // Return download URL (Cloudinary URL)
    ResponseUtil.success(res, result, "Download URL retrieved");
  });

  getPreview = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.getPreviewUrl(
      req.user!.id,
      req.params.id as string,
    );

    // Return preview URL (Cloudinary URL)
    ResponseUtil.success(res, result, "Preview URL retrieved");
  });

  getThumbnail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.getThumbnailUrl(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(res, result, "Thumbnail URL retrieved");
  });

  renameFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.renameFile(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result.file, "File renamed successfully");
  });

  deleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.deleteFile(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(res, null, result.message);
  });

  moveFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.moveFile(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result.file, "File moved successfully");
  });

  copyFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.copyFile(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result.file, "File copied successfully");
  });

  favoriteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.toggleFavorite(
      req.user!.id,
      req.params.id as string,
      true,
    );
    ResponseUtil.success(res, result, "File marked as favorite");
  });

  unfavoriteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    await this.fileService.toggleFavorite(
      req.user!.id,
      req.params.id as string,
      false,
    );
    ResponseUtil.success(res, null, "File removed from favorites");
  });

  shareFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.shareFile(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result, "File shared successfully");
  });

  deleteShare = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.deleteShare(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(res, null, result.message);
  });

  // Bulk Operations
  bulkDeleteFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.bulkDeleteFiles(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(
      res,
      { deleted: result.deleted, count: result.count },
      result.message,
    );
  });

  bulkMoveFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.bulkMoveFiles(req.user!.id, req.body);
    ResponseUtil.success(
      res,
      { moved: result.moved, count: result.count },
      result.message,
    );
  });

  bulkFavoriteFiles = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.fileService.bulkFavoriteFiles(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(res, { count: result.count }, result.message);
  });
}
