import prisma from '@/lib/prisma';
import type { Folder } from '@/generated/prisma/client';

export class FolderRepository {
  async createFolder(data: {
    name: string;
    userId: string;
    parentId: string | null;
    path: string;
    level: number;
  }): Promise<Folder> {
    return await prisma.folder.create({
      data,
    });
  }

  async getFoldersByParent(userId: string, parentId: string | null) {
    return await prisma.folder.findMany({
      where: {
        userId,
        parentId: parentId || null,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFilesByFolder(folderId: string) {
    return await prisma.file.findMany({
      where: {
        folderId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFolderById(id: string, userId: string): Promise<Folder | null> {
    return await prisma.folder.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
    });
  }

  async getFolderWithChildren(id: string, userId: string) {
    return await prisma.folder.findFirst({
      where: {
        id,
        userId,
        isDeleted: false,
      },
      include: {
        children: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
        files: {
          where: { isDeleted: false },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async getChildrenFolders(id: string, userId: string) {
    return await prisma.folder.findMany({
      where: {
        parentId: id,
        userId,
        isDeleted: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateFolder(id: string, _userId: string, data: { name: string }): Promise<Folder> {
    return await prisma.folder.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }

  async softDeleteFolder(id: string): Promise<Folder> {
    return await prisma.folder.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
  }

  async moveFolder(id: string, targetFolderId: string | null, newPath: string, newLevel: number): Promise<Folder> {
    return await prisma.folder.update({
      where: { id },
      data: {
        parentId: targetFolderId,
        path: newPath,
        level: newLevel,
        updatedAt: new Date(),
      },
    });
  }

  async getAllDescendants(folderId: string, userId: string): Promise<Folder[]> {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) return [];

    return await prisma.folder.findMany({
      where: {
        userId,
        path: {
          startsWith: `${folder.path}/`,
        },
        isDeleted: false,
      },
    });
  }

  async getBreadcrumb(folderId: string, userId: string) {
    const folder = await this.getFolderById(folderId, userId);
    if (!folder) return [];

    const pathIds = folder.path.split('/').filter(id => id);
    
    if (pathIds.length === 0) return [folder];

    const folders = await prisma.folder.findMany({
      where: {
        id: { in: pathIds },
        userId,
        isDeleted: false,
      },
      orderBy: { level: 'asc' },
    });

    return [...folders, folder];
  }

  async getFolderTree(userId: string) {
    return await prisma.folder.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: [{ level: 'asc' }, { createdAt: 'desc' }],
    });
  }

  async countFoldersByUser(userId: string): Promise<number> {
    return await prisma.folder.count({
      where: {
        userId,
        isDeleted: false,
      },
    });
  }

  async getFoldersByIds(ids: string[], userId: string): Promise<Folder[]> {
    return await prisma.folder.findMany({
      where: {
        id: { in: ids },
        userId,
        isDeleted: false,
      },
    });
  }

  async bulkSoftDelete(ids: string[]): Promise<number> {
    const result = await prisma.folder.updateMany({
      where: { id: { in: ids } },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });
    return result.count;
  }

  async checkFolderNameExists(name: string, parentId: string | null, userId: string): Promise<boolean> {
    const count = await prisma.folder.count({
      where: {
        name,
        parentId: parentId || null,
        userId,
        isDeleted: false,
      },
    });
    return count > 0;
  }
}

export default new FolderRepository();
