import { DashboardService } from '@/services/dashboard/dashboard.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';

export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  getDashboardStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const result = await this.dashboardService.getDashboardStats(userId);
    ResponseUtil.success(res, result, 'Dashboard stats retrieved successfully');
  });
}