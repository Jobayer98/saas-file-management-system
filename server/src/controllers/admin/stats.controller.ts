import { StatsService } from '@/services/admin/stats.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';


export class StatsController {
  constructor(private statsService: StatsService) { }

  getOverviewStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await this.statsService.getOverviewStats();
    ResponseUtil.success(res, result, 'Overview stats retrieved successfully');
  });

  getRevenueStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const from = req.query.from ? new Date(req.query.from as string) : undefined;
    const to = req.query.to ? new Date(req.query.to as string) : undefined;

    const result = await this.statsService.getRevenueStats(from, to);
    ResponseUtil.success(res, result, 'Revenue stats retrieved successfully');
  });

  getUsageStats = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await this.statsService.getUsageStats();
    ResponseUtil.success(res, result, 'Usage stats retrieved successfully');
  });
}
