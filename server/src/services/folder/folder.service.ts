import folderRepository from '@/repositories/folder/folder.repository';
import subscriptionRepository from '@/repositories/subscription/subscription.repository';
import { AppError } from '@/middlewares/error/error.middleware';
import {
  CreateFolderInput,
  UpdateFolderInput,
  MoveFolderInput,
  CopyFolderInput,
  BulkCreateFoldersInput,
  BulkDeleteFoldersInput,
  BulkMoveFoldersInput,
} from '@/validators/folder/folder.validator';

export class FolderService {
  async createFolder(userId: string, data: CreateFolderInput) {
    // Check subscription limits
    const subscription = await subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    const folderCount = await folderRepository.countFoldersByUser(userId);
    if (folderCount >= subscription.package.maxFolders) {
      throw new AppError('Folder limit reached', 403, 'FOLDER_LIMIT_REACHED');
    }

    // Check if folder name already exists in parent
    const nameExists = await folderRepository.checkFolderNameExists(
      data.name,
      data.parentId || null,
      userId
    );
    if (nameExists) {
      throw new AppError('Folder with this name already exists in this location', 400, 'FOLDER_NAME_EXISTS');
    }

    let level = 0;
    let path = '';

    if (data.parentId) {
      const parentFolder = await folderRepository.getFolderById(data.parentId, userId);
      if (!parentFolder) {
        throw new AppError('Parent folder not found', 404, 'PARENT_FOLDER_NOT_FOUND');
      }

      level = parentFolder.level + 1;
      path = parentFolder.path ? `${parentFolder.path}/${parentFolder.id}` : parentFolder.id;

      // Check nesting level limit
      if (level > subscription.package.maxNestingLevel) {
        throw new AppError('Maximum nesting level reached', 403, 'NESTING_LIMIT_REACHED');
      }
    }

    const folder = await folderRepository.createFolder({
      name: data.name,
      userId,
      parentId: data.parentId || null,
      path,
      level,
    });

    return { folder };
  }

  async getFolders(userId: string, parentId?: string) {
    const folders = await folderRepository.getFoldersByParent(userId, parentId || null);
    const files = parentId ? await folderRepository.getFilesByFolder(parentId) : [];

    return {
      folders,
      files: files.map(file => ({
        ...file,
        size: file.size.toString(),
      })),
    };
  }

  async getFolderById(userId: string, folderId: string) {
    const folderData = await folderRepository.getFolderWithChildren(folderId, userId);
    
    if (!folderData) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    return {
      folder: folderData,
      children: folderData.children,
      files: folderData.files.map(file => ({
        ...file,
        size: file.size.toString(),
      })),
    };
  }

  async getChildrenFolders(userId: string, folderId: string) {
    const folder = await folderRepository.getFolderById(folderId, userId);
    if (!folder) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    const folders = await folderRepository.getChildrenFolders(folderId, userId);
    return { folders };
  }

  async updateFolder(userId: string, folderId: string, data: UpdateFolderInput) {
    const folder = await folderRepository.getFolderById(folderId, userId);
    if (!folder) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    // Check if new name already exists in same parent
    if (data.name !== folder.name) {
      const nameExists = await folderRepository.checkFolderNameExists(
        data.name,
        folder.parentId,
        userId
      );
      if (nameExists) {
        throw new AppError('Folder with this name already exists in this location', 400, 'FOLDER_NAME_EXISTS');
      }
    }

    const updatedFolder = await folderRepository.updateFolder(folderId, userId, data);
    return { folder: updatedFolder };
  }

  async deleteFolder(userId: string, folderId: string) {
    const folder = await folderRepository.getFolderById(folderId, userId);
    if (!folder) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    // Soft delete the folder and all its descendants
    const descendants = await folderRepository.getAllDescendants(folderId, userId);
    const allIds = [folderId, ...descendants.map(d => d.id)];
    
    await folderRepository.bulkSoftDelete(allIds);

    return {
      message: 'Folder moved to trash',
      movedToTrash: true,
    };
  }

  async moveFolder(userId: string, folderId: string, data: MoveFolderInput) {
    const folder = await folderRepository.getFolderById(folderId, userId);
    if (!folder) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    // Check if moving to same location
    if (folder.parentId === data.targetFolderId) {
      throw new AppError('Folder is already in this location', 400, 'SAME_LOCATION');
    }

    let newLevel = 0;
    let newPath = '';

    if (data.targetFolderId) {
      const targetFolder = await folderRepository.getFolderById(data.targetFolderId, userId);
      if (!targetFolder) {
        throw new AppError('Target folder not found', 404, 'TARGET_FOLDER_NOT_FOUND');
      }

      // Check if trying to move folder into itself or its descendants
      if (targetFolder.path.includes(folderId)) {
        throw new AppError('Cannot move folder into itself or its descendants', 400, 'INVALID_MOVE');
      }

      newLevel = targetFolder.level + 1;
      newPath = targetFolder.path ? `${targetFolder.path}/${targetFolder.id}` : targetFolder.id;

      // Check nesting level
      const subscription = await subscriptionRepository.getCurrentSubscription(userId);
      if (subscription && newLevel > subscription.package.maxNestingLevel) {
        throw new AppError('Maximum nesting level reached', 403, 'NESTING_LIMIT_REACHED');
      }

      // Check if folder name already exists in target
      const nameExists = await folderRepository.checkFolderNameExists(
        folder.name,
        data.targetFolderId,
        userId
      );
      if (nameExists) {
        throw new AppError('Folder with this name already exists in target location', 400, 'FOLDER_NAME_EXISTS');
      }
    }

    const movedFolder = await folderRepository.moveFolder(folderId, data.targetFolderId || null, newPath, newLevel);
    return { folder: movedFolder };
  }

  async copyFolder(userId: string, folderId: string, data: CopyFolderInput) {
    const folder = await folderRepository.getFolderById(folderId, userId);
    if (!folder) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    // Check subscription limits
    const subscription = await subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    const folderCount = await folderRepository.countFoldersByUser(userId);
    if (folderCount >= subscription.package.maxFolders) {
      throw new AppError('Folder limit reached', 403, 'FOLDER_LIMIT_REACHED');
    }

    let level = 0;
    let path = '';

    if (data.targetFolderId) {
      const targetFolder = await folderRepository.getFolderById(data.targetFolderId, userId);
      if (!targetFolder) {
        throw new AppError('Target folder not found', 404, 'TARGET_FOLDER_NOT_FOUND');
      }

      level = targetFolder.level + 1;
      path = targetFolder.path ? `${targetFolder.path}/${targetFolder.id}` : targetFolder.id;

      if (level > subscription.package.maxNestingLevel) {
        throw new AppError('Maximum nesting level reached', 403, 'NESTING_LIMIT_REACHED');
      }
    }

    // Create copy with " - Copy" suffix
    const copyName = `${folder.name} - Copy`;
    const copiedFolder = await folderRepository.createFolder({
      name: copyName,
      userId,
      parentId: data.targetFolderId || null,
      path,
      level,
    });

    return { folder: copiedFolder };
  }

  async getBreadcrumb(userId: string, folderId: string) {
    const folder = await folderRepository.getFolderById(folderId, userId);
    if (!folder) {
      throw new AppError('Folder not found', 404, 'FOLDER_NOT_FOUND');
    }

    const breadcrumb = await folderRepository.getBreadcrumb(folderId, userId);
    return { path: breadcrumb };
  }

  async getFolderTree(userId: string) {
    const folders = await folderRepository.getFolderTree(userId);
    
    // Build tree structure
    const folderMap = new Map();
    const tree: any[] = [];

    folders.forEach(folder => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    folders.forEach(folder => {
      const node = folderMap.get(folder.id);
      if (folder.parentId && folderMap.has(folder.parentId)) {
        folderMap.get(folder.parentId).children.push(node);
      } else {
        tree.push(node);
      }
    });

    return { tree };
  }

  async bulkCreateFolders(userId: string, data: BulkCreateFoldersInput) {
    const subscription = await subscriptionRepository.getCurrentSubscription(userId);
    if (!subscription) {
      throw new AppError('No active subscription found', 403, 'NO_SUBSCRIPTION');
    }

    const currentCount = await folderRepository.countFoldersByUser(userId);
    if (currentCount + data.names.length > subscription.package.maxFolders) {
      throw new AppError('Folder limit would be exceeded', 403, 'FOLDER_LIMIT_EXCEEDED');
    }

    let level = 0;
    let path = '';

    if (data.parentId) {
      const parentFolder = await folderRepository.getFolderById(data.parentId, userId);
      if (!parentFolder) {
        throw new AppError('Parent folder not found', 404, 'PARENT_FOLDER_NOT_FOUND');
      }

      level = parentFolder.level + 1;
      path = parentFolder.path ? `${parentFolder.path}/${parentFolder.id}` : parentFolder.id;

      if (level > subscription.package.maxNestingLevel) {
        throw new AppError('Maximum nesting level reached', 403, 'NESTING_LIMIT_REACHED');
      }
    }

    const folders = await Promise.all(
      data.names.map(async (name) => {
        const nameExists = await folderRepository.checkFolderNameExists(
          name,
          data.parentId || null,
          userId
        );
        
        if (nameExists) {
          return null; // Skip duplicates
        }

        return await folderRepository.createFolder({
          name,
          userId,
          parentId: data.parentId || null,
          path,
          level,
        });
      })
    );

    const createdFolders = folders.filter(f => f !== null);
    return { folders: createdFolders };
  }

  async bulkDeleteFolders(userId: string, data: BulkDeleteFoldersInput) {
    const folders = await folderRepository.getFoldersByIds(data.folderIds, userId);
    
    if (folders.length === 0) {
      throw new AppError('No folders found', 404, 'FOLDERS_NOT_FOUND');
    }

    // Get all descendants for each folder
    const allIds = new Set<string>();
    for (const folder of folders) {
      allIds.add(folder.id);
      const descendants = await folderRepository.getAllDescendants(folder.id, userId);
      descendants.forEach(d => allIds.add(d.id));
    }

    const deletedCount = await folderRepository.bulkSoftDelete(Array.from(allIds));

    return {
      message: 'Folders moved to trash',
      deleted: Array.from(allIds),
      count: deletedCount,
    };
  }

  async bulkMoveFolders(userId: string, data: BulkMoveFoldersInput) {
    const folders = await folderRepository.getFoldersByIds(data.folderIds, userId);
    
    if (folders.length === 0) {
      throw new AppError('No folders found', 404, 'FOLDERS_NOT_FOUND');
    }

    let newLevel = 0;
    let newPath = '';

    if (data.targetFolderId) {
      const targetFolder = await folderRepository.getFolderById(data.targetFolderId, userId);
      if (!targetFolder) {
        throw new AppError('Target folder not found', 404, 'TARGET_FOLDER_NOT_FOUND');
      }

      // Check if any folder is being moved into itself
      for (const folder of folders) {
        if (targetFolder.path.includes(folder.id)) {
          throw new AppError('Cannot move folder into itself or its descendants', 400, 'INVALID_MOVE');
        }
      }

      newLevel = targetFolder.level + 1;
      newPath = targetFolder.path ? `${targetFolder.path}/${targetFolder.id}` : targetFolder.id;

      const subscription = await subscriptionRepository.getCurrentSubscription(userId);
      if (subscription && newLevel > subscription.package.maxNestingLevel) {
        throw new AppError('Maximum nesting level reached', 403, 'NESTING_LIMIT_REACHED');
      }
    }

    const movedFolders = await Promise.all(
      folders.map(folder => 
        folderRepository.moveFolder(folder.id, data.targetFolderId || null, newPath, newLevel)
      )
    );

    return {
      message: 'Folders moved successfully',
      moved: movedFolders,
    };
  }
}

export default new FolderService();
