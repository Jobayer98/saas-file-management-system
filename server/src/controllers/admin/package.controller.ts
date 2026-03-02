import { PackageService } from '@/services/admin/package.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';

export class PackageController {

  constructor(private packageService: PackageService) { }

  createPackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.packageService.createPackage(req.body);
    ResponseUtil.success(res, result.package, 'Package created successfully', 201);
  });

  getAllPackages = asyncHandler(async (_req: AuthRequest, res: Response) => {
    const result = await this.packageService.getAllPackages();
    ResponseUtil.success(res, result.packages, 'Packages retrieved successfully');
  });

  getPackageById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await this.packageService.getPackageById(id);
    ResponseUtil.success(res, result.package, 'Package retrieved successfully');
  });

  updatePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await this.packageService.updatePackage(id, req.body);
    ResponseUtil.success(res, result.package, 'Package updated successfully');
  });

  deletePackage = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await this.packageService.deletePackage(id);
    ResponseUtil.success(res, null, result.message);
  });

  togglePackageStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const id = parseInt(req.params.id as string);
    const result = await this.packageService.togglePackageStatus(id);
    ResponseUtil.success(res, { isActive: result.isActive }, result.message);
  });
};
