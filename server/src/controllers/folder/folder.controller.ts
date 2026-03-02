import { Response } from 'express';
import folderService from '@/services/folder/folder.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';

export class FolderController {
  createFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.createFolder(req.user!.id, req.body);
    ResponseUtil.success(res, result.folder, 'Folder created successfully', 201);
  });

  getFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const parentId = req.query.parentId as string | undefined;
    const result = await folderService.getFolders(req.user!.id, parentId);
    ResponseUtil.success(res, result, 'Folders retrieved successfully');
  });

  getFolderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.getFolderById(req.user!.id, req.params.id as string);
    ResponseUtil.success(res, result, 'Folder retrieved successfully');
  });

  getChildrenFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.getChildrenFolders(req.user!.id, req.params.id as string);
    ResponseUtil.success(res, result.folders, 'Children folders retrieved successfully');
  });

  updateFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.updateFolder(req.user!.id, req.params.id as string, req.body);
    ResponseUtil.success(res, result.folder, 'Folder updated successfully');
  });

  deleteFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.deleteFolder(req.user!.id, req.params.id as string);
    ResponseUtil.success(res, { movedToTrash: result.movedToTrash }, result.message);
  });

  moveFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.moveFolder(req.user!.id, req.params.id as string, req.body);
    ResponseUtil.success(res, result.folder, 'Folder moved successfully');
  });

  copyFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.copyFolder(req.user!.id, req.params.id as string, req.body);
    ResponseUtil.success(res, result.folder, 'Folder copied successfully');
  });

  getBreadcrumb = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.getBreadcrumb(req.user!.id, req.params.id as string);
    ResponseUtil.success(res, result.path, 'Breadcrumb retrieved successfully');
  });

  getFolderTree = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.getFolderTree(req.user!.id);
    ResponseUtil.success(res, result.tree, 'Folder tree retrieved successfully');
  });

  bulkCreateFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.bulkCreateFolders(req.user!.id, req.body);
    ResponseUtil.success(res, result.folders, 'Folders created successfully', 201);
  });

  bulkDeleteFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.bulkDeleteFolders(req.user!.id, req.body);
    ResponseUtil.success(res, { deleted: result.deleted, count: result.count }, result.message);
  });

  bulkMoveFolders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await folderService.bulkMoveFolders(req.user!.id, req.body);
    ResponseUtil.success(res, { moved: result.moved }, result.message);
  });
}

export default new FolderController();
