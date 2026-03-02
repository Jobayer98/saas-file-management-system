import userRepository from '../../repositories/admin/user.repository';
import { AppError } from '../../middlewares/error/error.middleware';

export class UserService {
  async getAllUsers(page: number, limit: number, search?: string) {
    const { users, total } = await userRepository.getAllUsers(page, limit, search);
    
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const usage = await userRepository.getUserUsageStats(id);

    return {
      user,
      subscription: user.subscription,
      usage: {
        fileCount: usage.fileCount,
        folderCount: usage.folderCount,
        totalSize: usage.totalSize.toString(),
      },
    };
  }

  async updateUserRole(id: string, isAdmin: boolean) {
    const existing = await userRepository.getUserById(id);
    
    if (!existing) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    const user = await userRepository.updateUserRole(id, isAdmin);
    
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        isAdmin: user.isAdmin,
      },
    };
  }

  async suspendUser(id: string, reason: string) {
    const existing = await userRepository.getUserById(id);
    
    if (!existing) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (existing.isSuspended) {
      throw new AppError('User is already suspended', 400, 'USER_ALREADY_SUSPENDED');
    }

    await userRepository.suspendUser(id, reason);
    
    return { message: 'User suspended successfully' };
  }

  async activateUser(id: string) {
    const existing = await userRepository.getUserById(id);
    
    if (!existing) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!existing.isSuspended) {
      throw new AppError('User is not suspended', 400, 'USER_NOT_SUSPENDED');
    }

    await userRepository.activateUser(id);
    
    return { message: 'User activated successfully' };
  }
}

export default new UserService();
