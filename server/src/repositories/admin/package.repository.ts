import { Package } from '@/generated/prisma/client';
import prisma from '@/lib/prisma';
import { CreatePackageInput, UpdatePackageInput } from '@/validators/admin/package.validator';

export class PackageRepository {
  async createPackage(data: CreatePackageInput): Promise<Package> {
    return await prisma.package.create({
      data: {
        ...data,
        maxFileSize: BigInt(data.maxFileSize),
        totalFileLimit: BigInt(data.totalFileLimit),
      },
    });
  }

  async getAllPackages(): Promise<Package[]> {
    return await prisma.package.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async getPackageById(id: number): Promise<Package | null> {
    return await prisma.package.findUnique({
      where: { id },
    });
  }

  async updatePackage(id: number, data: UpdatePackageInput): Promise<Package> {
    const updateData: any = { ...data };
    
    if (data.maxFileSize !== undefined) {
      updateData.maxFileSize = BigInt(data.maxFileSize);
    }
    if (data.totalFileLimit !== undefined) {
      updateData.totalFileLimit = BigInt(data.totalFileLimit);
    }

    return await prisma.package.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePackage(id: number): Promise<void> {
    await prisma.package.delete({
      where: { id },
    });
  }

  async togglePackageStatus(id: number): Promise<Package> {
    const pkg = await this.getPackageById(id);
    if (!pkg) throw new Error('Package not found');

    return await prisma.package.update({
      where: { id },
      data: { isActive: !pkg.isActive },
    });
  }

  async getPackageWithSubscriptionCount(id: number) {
    return await prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }
}

export default new PackageRepository();
