import packageService from '@/services/admin/package.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';

export class PackageController {
  createPackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await packageService.createPackage(req.body);
    ResponseUtil.success(res, result.package, 'Package created successfully', 201);
  });

  getAllPackages = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await packageService.getAllPackages();
    ResponseUtil.success(res, result.packages, 'Packages retrieved successfully');
  });

  getPackageById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await packageService.getPackageById(id);
    ResponseUtil.success(res, result.package, 'Package retrieved successfully');
  });

  updatePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await packageService.updatePackage(id, req.body);
    ResponseUtil.success(res, result.package, 'Package updated successfully');
  });

  deletePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await packageService.deletePackage(id);
    ResponseUtil.success(res, null, result.message);
  });

  togglePackageStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await packageService.togglePackageStatus(id);
    ResponseUtil.success(res, { isActive: result.isActive }, result.message);
  });
}

export default new PackageController();
