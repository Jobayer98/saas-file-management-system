import { SubscriptionRepository } from '@/repositories/subscription/subscription.repository';
import { AppError } from '@/middlewares/error/error.middleware';

export class SubscriptionService {
  constructor(
    private subscriptionRepository: SubscriptionRepository,
  ) { }

  async getActivePackages() {
    const packages = await this.subscriptionRepository.getActivePackages();
    
    return {
      packages: packages.map((pkg: any) => ({
        ...pkg,
        maxFileSize: pkg.maxFileSize.toString(),
        totalFileLimit: pkg.totalFileLimit.toString(),
      })),
    };
  }

  async getCurrentSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (!subscription) {
      return {
        subscription: null,
        package: null,
        usage: {
          fileCount: 0,
          folderCount: 0,
          totalSize: '0',
          percentUsed: 0,
        },
      };
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const totalSizeNum = Number(usage.totalSize);
    const limitNum = Number(subscription.package.totalFileLimit);
    const percentUsed = limitNum > 0 ? (totalSizeNum / limitNum) * 100 : 0;

    return {
      subscription: {
        id: subscription.id,
        packageId: subscription.packageId,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: subscription.isActive,
      },
      package: {
        ...subscription.package,
        maxFileSize: subscription.package.maxFileSize.toString(),
        totalFileLimit: subscription.package.totalFileLimit.toString(),
      },
      usage: {
        fileCount: usage.fileCount,
        folderCount: usage.folderCount,
        totalSize: usage.totalSize.toString(),
        percentUsed: Math.round(percentUsed * 100) / 100,
      },
    };
  }

  async selectPackage(userId: string, packageId: number) {
    const pkg = await this.subscriptionRepository.getPackageById(packageId);
    
    if (!pkg) {
      throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    if (!pkg.isActive) {
      throw new AppError('Package is not active', 400, 'PACKAGE_INACTIVE');
    }

    const existingSubscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (existingSubscription) {
      throw new AppError(
        'User already has a subscription. Use change package endpoint instead.',
        400,
        'SUBSCRIPTION_EXISTS'
      );
    }

    const subscription = await this.subscriptionRepository.createSubscription(userId, packageId);
    
    return {
      subscription: {
        id: subscription.id,
        packageId: subscription.packageId,
        startDate: subscription.startDate,
        isActive: subscription.isActive,
      },
    };
  }

  async changePackage(userId: string, newPackageId: number) {
    const pkg = await this.subscriptionRepository.getPackageById(newPackageId);
    
    if (!pkg) {
      throw new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    if (!pkg.isActive) {
      throw new AppError('Package is not active', 400, 'PACKAGE_INACTIVE');
    }

    const existingSubscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (!existingSubscription) {
      throw new AppError(
        'No active subscription found. Use select package endpoint instead.',
        404,
        'NO_SUBSCRIPTION'
      );
    }

    if (existingSubscription.packageId === newPackageId) {
      throw new AppError('Already subscribed to this package', 400, 'SAME_PACKAGE');
    }

    const subscription = await this.subscriptionRepository.updateSubscription(userId, newPackageId);
    
    return {
      subscription: {
        id: subscription.id,
        packageId: subscription.packageId,
        startDate: subscription.startDate,
        isActive: subscription.isActive,
      },
      message: 'Package changed successfully',
    };
  }

  async getSubscriptionHistory(userId: string, page: number, limit: number) {
    const { history, total } = await this.subscriptionRepository.getSubscriptionHistory(userId, page, limit);
    
    return {
      history: history.map((sub: any) => ({
        id: sub.id,
        packageName: sub.package.name,
        price: sub.package.price,
        startDate: sub.startDate,
        endDate: sub.endDate,
        isActive: sub.isActive,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getUsageStats(userId: string) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (!subscription) {
      throw new AppError('No active subscription found', 404, 'NO_SUBSCRIPTION');
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const totalSizeNum = Number(usage.totalSize);
    const limitNum = Number(subscription.package.totalFileLimit);
    const percentUsed = limitNum > 0 ? (totalSizeNum / limitNum) * 100 : 0;

    return {
      fileCount: usage.fileCount,
      folderCount: usage.folderCount,
      totalSize: usage.totalSize.toString(),
      percentUsed: Math.round(percentUsed * 100) / 100,
    };
  }

  async getLimits(userId: string) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (!subscription) {
      throw new AppError('No active subscription found', 404, 'NO_SUBSCRIPTION');
    }

    const usage = await this.subscriptionRepository.getUserUsageStats(userId);
    const pkg = subscription.package;

    return {
      current: {
        fileCount: usage.fileCount,
        folderCount: usage.folderCount,
        totalSize: usage.totalSize.toString(),
      },
      allowed: {
        maxFolders: pkg.maxFolders,
        maxNestingLevel: pkg.maxNestingLevel,
        maxFileSize: pkg.maxFileSize.toString(),
        totalFileLimit: pkg.totalFileLimit.toString(),
        filesPerFolder: pkg.filesPerFolder,
      },
      remaining: {
        folders: Math.max(0, pkg.maxFolders - usage.folderCount),
        storage: Math.max(0, Number(pkg.totalFileLimit) - Number(usage.totalSize)).toString(),
      },
    };
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (!subscription) {
      throw new AppError('No active subscription found', 404, 'NO_SUBSCRIPTION');
    }

    if (!subscription.isActive) {
      throw new AppError('Subscription is already cancelled', 400, 'ALREADY_CANCELLED');
    }

    const updated = await this.subscriptionRepository.cancelSubscription(userId);
    
    return {
      message: 'Subscription cancelled successfully',
      endDate: updated.endDate,
    };
  }

  async renewSubscription(userId: string) {
    const subscription = await this.subscriptionRepository.getCurrentSubscription(userId);
    
    if (!subscription) {
      throw new AppError('No subscription found', 404, 'NO_SUBSCRIPTION');
    }

    if (subscription.isActive) {
      throw new AppError('Subscription is already active', 400, 'ALREADY_ACTIVE');
    }

    const updated = await this.subscriptionRepository.renewSubscription(userId);
    
    return {
      subscription: {
        id: updated.id,
        packageId: updated.packageId,
        startDate: updated.startDate,
        isActive: updated.isActive,
      },
    };
  }
}
