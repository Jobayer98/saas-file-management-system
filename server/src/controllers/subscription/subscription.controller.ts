import { Response } from 'express';
import { SubscriptionService } from '@/services/subscription/subscription.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';

export class SubscriptionController {
  constructor(private subscriptionService: SubscriptionService) { }

  getActivePackages = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.getActivePackages();
    ResponseUtil.success(res, result, 'Active packages retrieved successfully');
  });

  getCurrentSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.getCurrentSubscription(req.user!.id);
    ResponseUtil.success(res, result, 'Current subscription retrieved successfully');
  });

  selectPackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.selectPackage(req.user!.id, req.body.packageId);
    ResponseUtil.success(res, result, 'Package selected successfully', 201);
  });

  changePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.changePackage(req.user!.id, req.body.newPackageId);
    ResponseUtil.success(res, result, result.message);
  });

  getSubscriptionHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await this.subscriptionService.getSubscriptionHistory(req.user!.id, page, limit);
    ResponseUtil.success(res, result, 'Subscription history retrieved successfully');
  });

  getUsageStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.getUsageStats(req.user!.id);
    ResponseUtil.success(res, result, 'Usage stats retrieved successfully');
  });

  getLimits = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.getLimits(req.user!.id);
    ResponseUtil.success(res, result, 'Limits retrieved successfully');
  });

  cancelSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.cancelSubscription(req.user!.id);
    ResponseUtil.success(res, result, result.message);
  });

  renewSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.subscriptionService.renewSubscription(req.user!.id);
    ResponseUtil.success(res, result, 'Subscription renewed successfully');
  });
}
