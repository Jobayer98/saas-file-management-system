import authService from '@/services/auth/auth.service';
import { AuthRequest } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { ResponseUtil } from '@/utils/response';
import { Response } from 'express';


export class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.register(req.body);
    ResponseUtil.success(res, { userId: result.userId }, result.message, 201);
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.login(req.body);
    ResponseUtil.success(res, result, 'Login successful');
  });

  logout = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { refreshToken } = req.body;
    const result = await authService.logout(refreshToken);
    ResponseUtil.success(res, null, result.message);
  });

  verifyEmail = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.verifyEmail(req.body.token);
    ResponseUtil.success(res, null, result.message);
  });

  forgotPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.forgotPassword(req.body);
    ResponseUtil.success(res, null, result.message);
  });

  resetPassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.resetPassword(req.body);
    ResponseUtil.success(res, null, result.message);
  });

  refreshToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.refreshAccessToken(req.body.refreshToken);
    ResponseUtil.success(res, result, 'Token refreshed successfully');
  });

  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    const result = await authService.getMe(req.user!.id);
    ResponseUtil.success(res, result.user, 'User retrieved successfully');
  });
}

export default new AuthController();
