import { PrismaClient } from '@prisma/client';

export class DashboardRepository {
  constructor(private prisma: PrismaClient) {}

  async getTotalFiles(userId: string): Promise<number> {
    return await this.prisma.file.count({
      where: {
        userId,
        isDeleted: false
      }
    });
  }

  async getTotalFolders(userId: string): Promise<number> {
    return await this.prisma.folder.count({
      where: {
        userId,
        isDeleted: false
      }
    });
  }

  async getStorageUsed(userId: string): Promise<string> {
    const result = await this.prisma.file.aggregate({
      where: {
        userId,
        isDeleted: false
      },
      _sum: {
        size: true
      }
    });

    const totalBytes = result._sum.size || BigInt(0);
    return this.formatBytes(Number(totalBytes));
  }

  async getUserSubscription(userId: string) {
    return await this.prisma.subscription.findUnique({
      where: {
        userId,
        isActive: true
      },
      include: {
        package: {
          select: {
            name: true
          }
        }
      }
    });
  }

  async getRecentFiles(userId: string, limit: number) {
    const files = await this.prisma.file.findMany({
      where: {
        userId,
        isDeleted: false
      },
      select: {
        id: true,
        name: true,
        originalName: true,
        mimeType: true,
        size: true,
        createdAt: true,
        updatedAt: true,
        folder: {
          select: {
            name: true,
            path: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: limit
    });

    // Convert BigInt size to string to avoid serialization issues
    return files.map(file => ({
      ...file,
      size: file.size.toString()
    }));
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}