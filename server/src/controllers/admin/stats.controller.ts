import statsService from '@/services/admin/stats.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';


export class StatsController {
  getOverviewStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await statsService.getOverviewStats();
    ResponseUtil.success(res, result, 'Overview stats retrieved successfully');
  });

  getRevenueStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const from = req.query.from as string;
    const to = req.query.to as string;
    
    const result = await statsService.getRevenueStats(from, to);
    ResponseUtil.success(res, result, 'Revenue stats retrieved successfully');
  });

  getUsageStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await statsService.getUsageStats();
    ResponseUtil.success(res, result, 'Usage stats retrieved successfully');
  });
}

export default new StatsController();
