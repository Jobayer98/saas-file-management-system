import { TrashService } from '@/services/trash/trash.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';

export class TrashController {
  constructor(private trashService: TrashService) {}

  getTrashItems = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.trashService.getTrashItems(req.user!.id);
    ResponseUtil.success(res, result, 'Trash items retrieved successfully');
  });

  restoreFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.trashService.restoreFile(req.user!.id, String(req.params.id));
    ResponseUtil.success(res, result, result.message);
  });

  restoreFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.trashService.restoreFolder(req.user!.id, String(req.params.id));
    ResponseUtil.success(res, result, result.message);
  });

  permanentlyDeleteFile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.trashService.permanentlyDeleteFile(req.user!.id, String(req.params.id));
    ResponseUtil.success(res, null, result.message);
  });

  permanentlyDeleteFolder = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.trashService.permanentlyDeleteFolder(req.user!.id, String(req.params.id));
    ResponseUtil.success(res, null, result.message);
  });

  emptyTrash = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.trashService.emptyTrash(req.user!.id);
    ResponseUtil.success(res, result, result.message);
  });
}
