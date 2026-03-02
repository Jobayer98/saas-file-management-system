import { Package, PrismaClient } from '@/generated/prisma/client';
import { CreatePackageInput, UpdatePackageInput } from '@/validators/admin/package.validator';

export class PackageRepository {
  constructor(private prisma: PrismaClient) { }

  async createPackage(data: CreatePackageInput): Promise<Package> {
    return await this.prisma.package.create({
      data: {
        ...data,
        maxFileSize: BigInt(data.maxFileSize),
        totalFileLimit: BigInt(data.totalFileLimit),
      },
    });
  }

  async getAllPackages(): Promise<Package[]> {
    return await this.prisma.package.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async getPackageById(id: number): Promise<Package | null> {
    return await this.prisma.package.findUnique({
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

    return await this.prisma.package.update({
      where: { id },
      data: updateData,
    });
  }

  async deletePackage(id: number): Promise<void> {
    await this.prisma.package.delete({
      where: { id },
    });
  }

  async togglePackageStatus(id: number): Promise<Package> {
    const pkg = await this.getPackageById(id);
    if (!pkg) throw new Error('Package not found');

    return await this.prisma.package.update({
      where: { id },
      data: { isActive: !pkg.isActive },
    });
  }

  async getPackageWithSubscriptionCount(id: number) {
    return await this.prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: { subscriptions: true },
        },
      },
    });
  }
}
