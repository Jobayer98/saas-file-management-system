import { UserService } from '@/services/admin/user.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';


export class UserController {

  constructor(private userService: UserService) { }

  getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;

    const result = await this.userService.getAllUsers(page, limit, search);
    ResponseUtil.success(res, result, 'Users retrieved successfully');
  });

  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.userService.getUserById(req.params.id as string);
    ResponseUtil.success(res, result, 'User retrieved successfully');
  });

  updateUserRole = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.userService.updateUserRole(req.params.id as string, req.body.isAdmin);
    ResponseUtil.success(res, result.user, 'User role updated successfully');
  });

  suspendUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.userService.suspendUser(req.params.id as string, req.body.reason);
    ResponseUtil.success(res, null, result.message);
  });

  activateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await this.userService.activateUser(req.params.id as string);
    ResponseUtil.success(res, null, result.message);
  });
}
