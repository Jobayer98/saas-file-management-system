import { Response } from "express";
import { FolderService } from "@/services/folder/folder.service";
import { AuthRequest } from "@/types";
import { asyncHandler } from "@/utils/asyncHandler";
import { ResponseUtil } from "@/utils/response";

export class FolderController {
  constructor(private folderService: FolderService) {}

  createFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.createFolder(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(
      res,
      result.folder,
      "Folder created successfully",
      201,
    );
  });

  getFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const parentId = req.query.parentId as string | undefined;
    const result = await this.folderService.getFolders(req.user!.id, parentId);
    ResponseUtil.success(res, result, "Folders retrieved successfully");
  });

  getFolderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.getFolderById(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(res, result, "Folder retrieved successfully");
  });

  getChildrenFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.getChildrenFolders(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(
      res,
      result.folders,
      "Children folders retrieved successfully",
    );
  });

  updateFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.updateFolder(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result.folder, "Folder updated successfully");
  });

  deleteFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.deleteFolder(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(
      res,
      { movedToTrash: result.movedToTrash },
      result.message,
    );
  });

  moveFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.moveFolder(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result.folder, "Folder moved successfully");
  });

  copyFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.copyFolder(
      req.user!.id,
      req.params.id as string,
      req.body,
    );
    ResponseUtil.success(res, result.folder, "Folder copied successfully");
  });

  getBreadcrumb = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.getBreadcrumb(
      req.user!.id,
      req.params.id as string,
    );
    ResponseUtil.success(res, result.path, "Breadcrumb retrieved successfully");
  });

  getFolderTree = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.getFolderTree(req.user!.id);
    ResponseUtil.success(
      res,
      result.tree,
      "Folder tree retrieved successfully",
    );
  });

  bulkCreateFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.bulkCreateFolders(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(
      res,
      result.folders,
      "Folders created successfully",
      201,
    );
  });

  bulkDeleteFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.bulkDeleteFolders(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(
      res,
      { deleted: result.deleted, count: result.count },
      result.message,
    );
  });

  bulkMoveFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.folderService.bulkMoveFolders(
      req.user!.id,
      req.body,
    );
    ResponseUtil.success(res, { moved: result.moved }, result.message);
  });
}
