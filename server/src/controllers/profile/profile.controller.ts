import { ProfileService } from '@/services/profile/profile.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';

export class ProfileController {
  constructor(private profileService: ProfileService) {}

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.profileService.getProfile(req.user!.id);
    ResponseUtil.success(res, result.user, 'Profile retrieved successfully');
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.profileService.updateProfile(req.user!.id, req.body);
    ResponseUtil.success(res, result.user, result.message);
  });

  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.profileService.changePassword(req.user!.id, req.body);
    ResponseUtil.success(res, null, result.message);
  });

  deleteAccount = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.profileService.deleteAccount(req.user!.id);
    ResponseUtil.success(res, null, result.message);
  });
}
