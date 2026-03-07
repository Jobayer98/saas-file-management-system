import { AppError } from "@/middlewares/error/error.middleware";
import { UserRepository } from "@/repositories/admin/user.repository";

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async getAllUsers(page: number, limit: number, search?: string) {
    const { users, total } = await this.userRepository.getAllUsers(
      page,
      limit,
      search,
    );

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.getUserById(id);

    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const usage = await this.userRepository.getUserUsageStats(id);

    return {
      user: {
        ...user,
        subscription: user.subscription ? {
          ...user.subscription,
          package: {
            ...user.subscription.package,
            maxFileSize: user.subscription.package.maxFileSize.toString(),
            totalFileLimit: user.subscription.package.totalFileLimit.toString(),
          },
        } : null,
      },
      usage: {
        fileCount: usage.fileCount,
        folderCount: usage.folderCount,
        totalSize: usage.totalSize.toString(),
      },
    };
  }

  async updateUserRole(id: string, isAdmin: boolean) {
    const existing = await this.userRepository.getUserById(id);

    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    const user = await this.userRepository.updateUserRole(id, isAdmin);

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
    const existing = await this.userRepository.getUserById(id);

    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (existing.isSuspended) {
      throw new AppError(
        "User is already suspended",
        400,
        "USER_ALREADY_SUSPENDED",
      );
    }

    await this.userRepository.suspendUser(id, reason);

    return { message: "User suspended successfully" };
  }

  async activateUser(id: string) {
    const existing = await this.userRepository.getUserById(id);

    if (!existing) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    if (!existing.isSuspended) {
      throw new AppError("User is not suspended", 400, "USER_NOT_SUSPENDED");
    }

    await this.userRepository.activateUser(id);

    return { message: "User activated successfully" };
  }
}
