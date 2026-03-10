import { AppError } from "@/middlewares/error/error.middleware";
import { PackageRepository } from "@/repositories/admin/package.repository";
import {
  CreatePackageInput,
  UpdatePackageInput,
} from "@/validators/admin/package.validator";
import { CacheService } from "../cache/cache.service";

export class PackageService {
  constructor(
    private packageRepository: PackageRepository,
    private cacheService: CacheService,
  ) {}

  async createPackage(data: CreatePackageInput) {
    const pkg = await this.packageRepository.createPackage(data);

    return {
      package: {
        ...pkg,
        maxFileSize: pkg.maxFileSize.toString(),
        totalFileLimit: pkg.totalFileLimit.toString(),
      },
    };
  }

  async getAllPackages() {
    const packages = await this.packageRepository.getAllPackages();

    return {
      packages: packages.map((pkg) => ({
        ...pkg,
        maxFileSize: pkg.maxFileSize.toString(),
        totalFileLimit: pkg.totalFileLimit.toString(),
      })),
    };
  }

  async getPackageById(id: number) {
    const pkg = await this.packageRepository.getPackageById(id);

    if (!pkg) {
      throw new AppError("Package not found", 404, "PACKAGE_NOT_FOUND");
    }

    return {
      package: {
        ...pkg,
        maxFileSize: pkg.maxFileSize.toString(),
        totalFileLimit: pkg.totalFileLimit.toString(),
      },
    };
  }

  async updatePackage(id: number, data: UpdatePackageInput) {
    const existing = await this.packageRepository.getPackageById(id);

    if (!existing) {
      throw new AppError("Package not found", 404, "PACKAGE_NOT_FOUND");
    }

    const pkg = await this.packageRepository.updatePackage(id, data);
    await this.cacheService.clear();

    return {
      package: {
        ...pkg,
        maxFileSize: pkg.maxFileSize.toString(),
        totalFileLimit: pkg.totalFileLimit.toString(),
      },
    };
  }

  async deletePackage(id: number) {
    const pkg =
      await this.packageRepository.getPackageWithSubscriptionCount(id);

    if (!pkg) {
      throw new AppError("Package not found", 404, "PACKAGE_NOT_FOUND");
    }

    if (pkg._count.subscriptions > 0) {
      throw new AppError(
        "Cannot delete package with active subscriptions",
        400,
        "PACKAGE_HAS_SUBSCRIPTIONS",
      );
    }

    await this.packageRepository.deletePackage(id);
    await this.cacheService.clear();

    return { message: "Package deleted successfully" };
  }

  async togglePackageStatus(id: number) {
    const pkg = await this.packageRepository.togglePackageStatus(id);

    return {
      isActive: pkg.isActive,
      message: `Package ${pkg.isActive ? "activated" : "deactivated"} successfully`,
    };
  }
}
