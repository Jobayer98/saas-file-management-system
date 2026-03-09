import { AppError } from "@/middlewares/error/error.middleware";
import { FileRepository } from "@/repositories/file/file.repository";
import { FolderRepository } from "@/repositories/folder/folder.repository";

export class TrashService {
  constructor(
    private fileRepository: FileRepository,
    private folderRepository: FolderRepository,
  ) {}

  async getTrashItems(userId: string) {
    const [files, folders] = await Promise.all([
      this.fileRepository.getDeletedFiles(userId),
      this.folderRepository.getDeletedFolders(userId),
    ]);

    return {
      files: files.map(file => ({ ...file, size: file.size.toString() })),
      folders,
    };
  }

  async restoreFile(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId, true);

    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    if (!file.isDeleted) {
      throw new AppError("File is not in trash", 400, "FILE_NOT_DELETED");
    }

    await this.fileRepository.restoreFile(fileId);

    return {
      message: "File restored successfully",
      file: { ...file, size: file.size.toString() },
    };
  }

  async restoreFolder(userId: string, folderId: string) {
    const folder = await this.folderRepository.getFolderById(
      folderId,
      userId,
      true,
    );

    if (!folder) {
      throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
    }

    if (!folder.isDeleted) {
      throw new AppError("Folder is not in trash", 400, "FOLDER_NOT_DELETED");
    }

    // Restore folder and all its descendants
    const descendants = await this.folderRepository.getAllDescendants(
      folderId,
      userId,
      true,
    );
    const allIds = [folderId, ...descendants.map((d) => d.id)];

    await this.folderRepository.bulkRestore(allIds);

    return {
      message: "Folder restored successfully",
      folder,
    };
  }

  async permanentlyDeleteFile(userId: string, fileId: string) {
    const file = await this.fileRepository.getFileById(fileId, userId, true);

    if (!file) {
      throw new AppError("File not found", 404, "FILE_NOT_FOUND");
    }

    if (!file.isDeleted) {
      throw new AppError("File is not in trash", 400, "FILE_NOT_DELETED");
    }

    await this.fileRepository.permanentlyDeleteFile(fileId);

    return {
      message: "File permanently deleted",
    };
  }

  async permanentlyDeleteFolder(userId: string, folderId: string) {
    const folder = await this.folderRepository.getFolderById(
      folderId,
      userId,
      true,
    );

    if (!folder) {
      throw new AppError("Folder not found", 404, "FOLDER_NOT_FOUND");
    }

    if (!folder.isDeleted) {
      throw new AppError("Folder is not in trash", 400, "FOLDER_NOT_DELETED");
    }

    // Permanently delete folder and all its descendants
    const descendants = await this.folderRepository.getAllDescendants(
      folderId,
      userId,
      true,
    );
    const allIds = [folderId, ...descendants.map((d) => d.id)];

    await this.folderRepository.bulkPermanentDelete(allIds);

    return {
      message: "Folder permanently deleted",
    };
  }

  async emptyTrash(userId: string) {
    const [files, folders] = await Promise.all([
      this.fileRepository.getDeletedFiles(userId),
      this.folderRepository.getDeletedFolders(userId),
    ]);

    const fileIds = files.map((f) => f.id);
    const folderIds = folders.map((f) => f.id);

    await Promise.all([
      fileIds.length > 0
        ? this.fileRepository.bulkPermanentDelete(fileIds)
        : Promise.resolve(),
      folderIds.length > 0
        ? this.folderRepository.bulkPermanentDelete(folderIds)
        : Promise.resolve(),
    ]);

    return {
      message: "Trash emptied successfully",
      deletedFiles: fileIds.length,
      deletedFolders: folderIds.length,
    };
  }

  /**
   * Auto-cleanup: Delete items that have been in trash for more than 30 days
   * This should be called by a scheduled job
   */
  async cleanupOldTrashItems() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get all deleted files and folders older than 30 days
    const [oldFiles, oldFolders] = await Promise.all([
      this.fileRepository.getDeletedFilesOlderThan(thirtyDaysAgo),
      this.folderRepository.getDeletedFoldersOlderThan(thirtyDaysAgo),
    ]);

    const fileIds = oldFiles.map((f) => f.id);
    const folderIds = oldFolders.map((f) => f.id);

    // Permanently delete old items
    await Promise.all([
      fileIds.length > 0
        ? this.fileRepository.bulkPermanentDelete(fileIds)
        : Promise.resolve(),
      folderIds.length > 0
        ? this.folderRepository.bulkPermanentDelete(folderIds)
        : Promise.resolve(),
    ]);

    return {
      deletedFiles: fileIds.length,
      deletedFolders: folderIds.length,
      message: `Auto-cleanup completed: ${fileIds.length} files and ${folderIds.length} folders permanently deleted`,
    };
  }
}
