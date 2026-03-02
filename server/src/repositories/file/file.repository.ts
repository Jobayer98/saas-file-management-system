import type { File, FileVersion, PrismaClient } from '@/generated/prisma/client';

export class FileRepository {
  constructor(private prisma: PrismaClient) { }

  async createFile(data: {
    name: string;
    originalName: string;
    mimeType: string;
    size: bigint;
    path: string;
    userId: string;
    folderId: string | null;
    thumbnailPath?: string;
  }): Promise<File> {
    return await this.prisma.file.create({
      data,
    });
  }

  async getFilesByFolder(folderId: string | null, userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where: any = {
      userId,
      isDeleted: false,
    };

    if (folderId) {
      where.folderId = folderId;
    } else {
      where.folderId = null;
    }

    const [files, total] = await Promise.all([
      this.prisma.file.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.file.count({ where }),
    ]);

    return { files, total };
  }

  async getFileById(id: string, userId: string): Promise<File | null> {
    return await this.prisma.file.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });
  }

  async updateFile(id: string, data: Partial<File>): Promise<File> {
    return await this.prisma.file.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDeleteFile(id: string): Promise<File> {
    return await this.prisma.file.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async toggleFavorite(id: string, isFavorite: boolean): Promise<File> {
    return await this.prisma.file.update({
      where: { id },
      data: { isFavorite },
    });
  }

  async getFilesByIds(ids: string[], userId: string): Promise<File[]> {
    return await this.prisma.file.findMany({
      where: {
        id: { in: ids },
        userId,
        isDeleted: false,
      },
    });
  }

  async bulkSoftDelete(ids: string[]): Promise<number> {
    const result = await this.prisma.file.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return result.count;
  }

  async bulkUpdateFolder(ids: string[], folderId: string | null): Promise<number> {
    const result = await this.prisma.file.updateMany({
      where: { id: { in: ids } },
      data: {
        folderId,
        updatedAt: new Date(),
      },
    });
    return result.count;
  }

  async bulkToggleFavorite(ids: string[], isFavorite: boolean): Promise<number> {
    const result = await this.prisma.file.updateMany({
      where: { id: { in: ids } },
      data: { isFavorite },
    });
    return result.count;
  }

  // File Versions
  async createFileVersion(data: {
    fileId: string;
    version: number;
    path: string;
    size: bigint;
  }): Promise<FileVersion> {
    return await this.prisma.fileVersion.create({
      data,
    });
  }

  async getFileVersions(fileId: string): Promise<FileVersion[]> {
    return await this.prisma.fileVersion.findMany({
      where: { fileId },
      orderBy: { version: 'desc' },
    });
  }

  async getFileVersionById(versionId: string): Promise<FileVersion | null> {
    return await this.prisma.fileVersion.findUnique({
      where: { id: versionId },
    });
  }

  async deleteFileVersion(versionId: string): Promise<void> {
    await this.prisma.fileVersion.delete({
      where: { id: versionId },
    });
  }

  async getLatestVersionNumber(fileId: string): Promise<number> {
    const latestVersion = await this.prisma.fileVersion.findFirst({
      where: { fileId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });

    return latestVersion?.version || 0;
  }

  async countFilesByUser(userId: string): Promise<number> {
    return await this.prisma.file.count({
      where: {
        userId,
        isDeleted: false,
      },
    });
  }

  async countFilesInFolder(folderId: string): Promise<number> {
    return await this.prisma.file.count({
      where: {
        folderId,
        isDeleted: false,
      },
    });
  }
}
