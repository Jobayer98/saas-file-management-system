import { Response } from 'express';
import subscriptionService from '@/services/subscription/subscription.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';

export class SubscriptionController {
  getActivePackages = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await subscriptionService.getActivePackages();
    ResponseUtil.success(res, result.packages, 'Active packages retrieved successfully');
  });

  getCurrentSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.getCurrentSubscription(req.user!.id);
    ResponseUtil.success(res, result, 'Current subscription retrieved successfully');
  });

  selectPackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.selectPackage(req.user!.id, req.body.packageId);
    ResponseUtil.success(res, result.subscription, 'Package selected successfully', 201);
  });

  changePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.changePackage(req.user!.id, req.body.newPackageId);
    ResponseUtil.success(res, result.subscription, result.message);
  });

  getSubscriptionHistory = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const result = await subscriptionService.getSubscriptionHistory(req.user!.id, page, limit);
    ResponseUtil.success(res, result, 'Subscription history retrieved successfully');
  });

  getUsageStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.getUsageStats(req.user!.id);
    ResponseUtil.success(res, result, 'Usage stats retrieved successfully');
  });

  getLimits = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.getLimits(req.user!.id);
    ResponseUtil.success(res, result, 'Limits retrieved successfully');
  });

  cancelSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.cancelSubscription(req.user!.id);
    ResponseUtil.success(res, { endDate: result.endDate }, result.message);
  });

  renewSubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await subscriptionService.renewSubscription(req.user!.id);
    ResponseUtil.success(res, result.subscription, 'Subscription renewed successfully');
  });
}

export default new SubscriptionController();
